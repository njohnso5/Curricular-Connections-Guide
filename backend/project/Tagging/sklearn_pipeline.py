from sklearn.feature_extraction.text import TfidfVectorizer, ENGLISH_STOP_WORDS
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
from Data_model.models import Theme

'''
This version of the classifier makes use of Scikit-learn to implement a cosine_similarity classifier. 

Initial tests show this to be somewhat accurate. Generates tags but some may be missing or inaccurate.

This version is much faster than the classifier using pytorch

'''


class Classifier:
    
    def __init__(self, themes : list[Theme] = [], description : str = "") -> None:
        self.themes = themes
        self.description = description

    def set_themes(self, themes : list[Theme] = []):
        self.themes = themes
    
    def add_theme(self, theme : Theme = None):
        self.tags.append(theme)
    
    def set_description(self, description : str = ""):
        self.description = description
    
    def classify(self):

        # Combine descriptions and tags into a list
        documents = [self.description] + [theme.name.lower() for theme in self.themes]

        # Create TF-IDF vectorizer
        vectorizer = TfidfVectorizer(stop_words=list(ENGLISH_STOP_WORDS))
        tfidf_matrix = vectorizer.fit_transform(documents)

        # Apply Latent Semantic Analysis (LSA)
        num_topics = 2
        lsa = TruncatedSVD(n_components=num_topics, random_state=42)
        lsa_matrix = lsa.fit_transform(tfidf_matrix)

        # Get LSA vectors for descriptions
        description1_vector = lsa_matrix[0].reshape(1, -1)
        # Get LSA vectors for tags
        tag_vectors = lsa_matrix[2:]

        # Calculate cosine similarity between descriptions and tags
        cosine_similarities = cosine_similarity(description1_vector, tag_vectors)

        # Find tags with high similarity based on an adjustable threshhold
        threshold = 0.95 
        matching_tags = [self.themes[i] for i, similarity in enumerate(cosine_similarities[0]) if similarity > threshold]

        return matching_tags