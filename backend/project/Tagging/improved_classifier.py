import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.pipeline import Pipeline
from sklearn.metrics.pairwise import cosine_similarity
from Data_model.models import Theme
import numpy as np


class Classifier:
    
    def __init__(self, themes : list[Theme]=None, description="", course_title=""):
        self.themes = themes if themes else []
        self.course_title = course_title
        self.description = description
        self.nlp = spacy.load("en_core_web_md", disable=["parser", "ner"])
        self.theme_doc = {}

    def set_themes(self, themes : list[Theme]):
        self.themes = themes if themes else []

    def add_theme(self, theme : Theme):
        self.themes.append(theme)
        # Call preprocess_themes to update the theme_doc dictionary
    
    def set_description(self, description : str):
        self.description = description
    
    def set_course_title(self, course_title : str):
        self.course_title = course_title


    def preprocess_text(self, text : str):
        # Tokenize and lemmatize text using spaCy
        doc = self.nlp(text)
        processed_text = " ".join(token.lemma_ for token in doc if not token.is_stop and token.is_alpha)
        return processed_text
    
    def preprocess_themes(self):
        for theme in self.themes:
            self.theme_doc[theme.name] = self.nlp(theme.name)

    def filter_themes(self, description : str, threashold=0.74):

        # Remove thems based on semantic similarity
        description_doc = self.nlp(description)
        filtered_themes = []
        removed_themes = []
        keep_threshold = 0.7
        for theme in self.themes:
            has_meaning = False
            keep = False
            for token in description_doc:
                if token.has_vector and self.theme_doc[theme.name].has_vector:
                    similarity = token.similarity(self.theme_doc[theme.name])

                if similarity > threashold:
                    has_meaning = True
                if similarity > keep_threshold:
                    keep = True
            if has_meaning:
                # Add the theme object to the list of filtered theme_name
                filtered_themes.append(theme)
            if not keep:
                removed_themes.append(theme)
        return [filtered_themes, removed_themes]
        
        
    

    def vectorize(self, themes : [] , description : str):

        processed_themes = [self.preprocess_text(theme.name.lower() + " art program topic") for theme in themes]
        # Preprocess description and themes
        processed_description = self.preprocess_text(description.lower())

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


        return [description_vector, tag_vectors]


    # def compute_similarity(self, tag, paragraph):
    #     tag_doc = self.nlp(tag + " art program topic")
    #     paragraph_doc = self.nlp(paragraph)
        
    #     return tag_doc.similarity(paragraph_doc)



    def classify(self):
        try:
            if not self.description or not self.themes:
                return []  # No description or themes, return empty list

            

            description_vector, tag_vectors = self.vectorize(self.themes, self.course_title + ", " + self.description)

            # Calculate cosine similarity between description and tags
            cosine_similarities = cosine_similarity(description_vector, tag_vectors).flatten()

            # Sort tags by similarity
            similar_tags = [self.themes[i] for i in np.argsort(cosine_similarities)[::-1]]

            # Use top 7 tags for similarity comparison against the description
            similar_tags = similar_tags[:7]
            # print(similar_tags)
            
            
            # description_vector, tag_vectors = self.vectorize(similar_tags, self.course_title + ", " + self.description)

            # cosine_similarities = cosine_similarity(description_vector, tag_vectors).flatten()
            # similar_tags = [similar_tags[i] for i in np.argsort(cosine_similarities)[::-1]]
            # similar_tags = similar_tags[:5]
            # # print(cosine_similarities)
            
            # threshold = 0.8
            # # # If the highest similarity is below the threshold, return the top 5 tags
            # if cosine_similarities[0] >= threshold:
            #     similar_tags = [theme for theme in similar_tags if cosine_similarities[similar_tags.index(theme)] > threshold]
  

            
            filtered_themes, removed_themes = self.filter_themes(self.course_title + ", " + self.description)
            # Combine the two lists and remove duplicates
            combined = similar_tags + filtered_themes
            similar_tags = []
            for theme in combined:
                if theme not in similar_tags and theme not in removed_themes:
                    similar_tags.append(theme)
            
            return similar_tags



        except Exception as e:
            # Print the line number of the error
            print(f"An error occurred: {e} on line {e.__traceback__.tb_lineno}")
            return []
