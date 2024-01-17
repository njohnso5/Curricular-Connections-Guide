import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.pipeline import Pipeline
from sklearn.metrics.pairwise import cosine_similarity
from Data_model.models import Theme

class Classifier:
    
    def __init__(self, themes : list[Theme]=None, description=""):
        self.themes = themes if themes else []
        self.description = description
        self.nlp = spacy.load("en_core_web_sm", disable=["parser", "ner"])

    def set_themes(self, themes : list[Theme]):
        self.themes = themes if themes else []

    def add_theme(self, theme : Theme):
        self.themes.append(theme)
    
    def set_description(self, description : str):
        self.description = description
    
    def preprocess_text(self, text : str):
        # Tokenize and lemmatize text using spaCy
        doc = self.nlp(text)
        processed_text = " ".join(token.lemma_ for token in doc if not token.is_stop and token.is_alpha)
        return processed_text
    
    def classify(self):
        try:
            if not self.description or not self.themes:
                return []  # No description or themes, return empty list
            
            # Preprocess description and themes
            processed_description = self.preprocess_text(self.description.lower())
            processed_themes = [self.preprocess_text(theme.name.lower()) for theme in self.themes]

            # Combine processed descriptions and tags into a list
            documents = [processed_description] + processed_themes

            # Create TF-IDF vectorizer with tuned parameters
            vectorizer = TfidfVectorizer(min_df=2, max_df=0.8)
            lsa = TruncatedSVD(n_components=2, random_state=42)

            # Pipeline for vectorization and LSA
            pipeline = Pipeline([
                ('tfidf', vectorizer),
                ('lsa', lsa)
            ])

            # Fit and transform
            lsa_matrix = pipeline.fit_transform(documents)

            # Get LSA vector for the description
            description_vector = lsa_matrix[0].reshape(1, -1)
            # Get LSA vectors for tags
            tag_vectors = lsa_matrix[1:]

            # Calculate cosine similarity between description and tags
            cosine_similarities = cosine_similarity(description_vector, tag_vectors).flatten()

            # Find tags with high similarity based on an adjustable threshold
            threshold = 0.60
            matching_tags_indices = [i for i, similarity in enumerate(cosine_similarities) if similarity > threshold]

            matching_tags = [self.themes[i] for i in matching_tags_indices]

            return matching_tags

        except Exception as e:
            print(f"An error occurred: {e}")
            return []
