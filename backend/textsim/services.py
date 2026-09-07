"""Extraction de texte et moteur d'analyse de similarité (n-grammes / Jaccard)."""

import re
import unicodedata
from collections import Counter

from django.core.exceptions import ValidationError

ALLOWED_EXTENSIONS = ['txt', 'docx', 'pdf']


# =======================================================================
# Normalisation
# =======================================================================

def _remove_accents(text):
    return ''.join(
        c for c in unicodedata.normalize('NFD', text)
        if unicodedata.category(c) != 'Mn'
    )


def normalize_text(text, mode='lowercase'):
    """Applique un prétraitement au texte selon le mode choisi."""
    text = text or ''

    if mode in ('lowercase', 'spaces', 'full'):
        text = text.lower()
    if mode in ('accents', 'full'):
        text = _remove_accents(text)
    if mode in ('spaces', 'full'):
        text = re.sub(r'\s+', ' ', text).strip()

    return text


def tokenize(text):
    """Découpe le texte en mots."""
    return re.findall(r"[a-zA-Z0-9À-ÿ'-]+", text.lower())


# =======================================================================
# Extraction de texte par format
# =======================================================================

def read_file_text(uploaded_file, ext, max_chars=500000):
    """Lit et extrait le texte d'un fichier TXT / DOCX / PDF."""
    ext = ext.lower().lstrip('.')

    if ext == 'txt':
        return _read_txt(uploaded_file, max_chars)
    if ext == 'docx':
        return _read_docx(uploaded_file, max_chars)
    if ext == 'pdf':
        return _read_pdf(uploaded_file, max_chars)

    raise ValidationError(f"Format non supporté : {ext}")


def _read_txt(uploaded_file, max_chars):
    raw = uploaded_file.read()
    try:
        text = raw.decode('utf-8')
    except UnicodeDecodeError:
        text = raw.decode('latin-1')
    return text[:max_chars]


def _read_docx(uploaded_file, max_chars):
    from docx import Document as DocxDocument

    doc = DocxDocument(uploaded_file)
    paragraphs = (p.text for p in doc.paragraphs if p.text and p.text.strip())
    text = '\n'.join(paragraphs)
    for table in doc.tables:
        for row in table.rows:
            cells = (cell.text for cell in row.cells if cell.text and cell.text.strip())
            text += '\n' + ' '.join(cells)
    return text[:max_chars]


def _read_pdf(uploaded_file, max_chars):
    from pypdf import PdfReader

    reader = PdfReader(uploaded_file)
    pages = (page.extract_text() or '' for page in reader.pages)
    text = '\n'.join(pages)
    return text[:max_chars]


def count_words(content):
    return len(tokenize(content))


# =======================================================================
# N-grammes
# =======================================================================

def generate_ngrams(content, n):
    """Génère les n-grammes de mots (ordre préservé) à partir du texte."""
    words = tokenize(content)
    if n <= 0 or len(words) < n:
        return []
    return [' '.join(words[i:i + n]) for i in range(len(words) - n + 1)]


# =======================================================================
# Analyse de similarité (Jaccard)
# =======================================================================

def analyze_pair(text1, text2, ngram_size):
    """
    Compare deux textes par n-grammes (similarité de Jaccard).

    Retourne un dictionnaire :
        similarity, common_ngrams, total_ngrams_doc1,
        total_ngrams_doc2, passages
    """
    ngrams1 = generate_ngrams(text1, ngram_size)
    ngrams2 = generate_ngrams(text2, ngram_size)

    counter1 = Counter(ngrams1)
    counter2 = Counter(ngrams2)

    common = sum((counter1 & counter2).values())
    union = sum((counter1 | counter2).values())

    similarity = (common / union * 100.0) if union else 0.0

    passages = _detect_passages(text1, text2, ngram_size, ngrams1, ngrams2)

    return {
        'similarity': round(similarity, 2),
        'common_ngrams': common,
        'total_ngrams_doc1': len(ngrams1),
        'total_ngrams_doc2': len(ngrams2),
        'passages': passages,
    }


def _detect_passages(text1, text2, ngram_size, ngrams1, ngrams2):
    """Regroupe les n-grammes communs consécutifs en passages de texte."""

    sentences1 = _split_sentences(text1)
    sentences2 = _split_sentences(text2)
    common_set = set(ngrams1) & set(ngrams2)

    passages = []
    seen1 = set()
    seen2 = set()

    for i, sent1 in enumerate(sentences1):
        if i in seen1:
            continue
        for j, sent2 in enumerate(sentences2):
            if j in seen2:
                continue

            ngrams_s1 = set(generate_ngrams(sent1, ngram_size))
            ngrams_s2 = set(generate_ngrams(sent2, ngram_size))
            overlap = ngrams_s1 & ngrams_s2 & common_set

            if overlap and len(overlap) >= 1:
                union = ngrams_s1 | ngrams_s2
                score = (len(overlap) / len(union) * 100.0) if union else 0.0

                if score >= 20:
                    passages.append({
                        'text1': sent1.strip(),
                        'text2': sent2.strip(),
                        'similarity': round(score, 2),
                    })
                    seen1.add(i)
                    seen2.add(j)

        passages.sort(key=lambda p: p['similarity'], reverse=True)

    return passages[:20]


def _split_sentences(text):
    parts = re.split(r'(?<=[.!?])\s+|\n+', text)
    return [p.strip() for p in parts if p.strip()]


def get_status(similarity, alert_threshold):
    """Détermine le statut d'une comparaison selon le seuil d'alerte."""
    if similarity >= alert_threshold:
        return 'plagiat'
    if similarity >= 40:
        return 'revision'
    return 'conforme'