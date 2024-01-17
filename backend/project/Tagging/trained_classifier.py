from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.multioutput import MultiOutputClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.preprocessing import MultiLabelBinarizer


'''
Unused Text Classifier implementation that is trainable.

'''
class Classifier:
    
    def __init__(self, tags : list[str] = [], description : str = "") -> None:
        self.mlb = MultiLabelBinarizer()
        self.vectorizer = TfidfVectorizer()
        self.classifier = None
        self.tags = tags
        self.description = [description]
        self.is_trained = False
 
    
    def set_tags(self, tags : list[str] = []):
        self.tags = tags
    
    def add_tag(self, tag : str):
        self.tags.append(tag)
        
    def train(self, texts : list[str], mapped_tags : list[list[str]]):
        
        y_binary = self.mlb.fit_transform(mapped_tags)

        X = self.vectorizer.fit_transform(texts)

        self.classifier = MultiOutputClassifier(MultinomialNB())
        self.classifier.fit(X, y_binary)
        
        self.is_trained = True    
     
    def classify(self):
        
        if not self.is_trained:
            raise ValueError
        
        text_vectorized = self.vectorizer.transform(self.description)
        predictions = self.classifier.predict(text_vectorized)
        predicted_labels = self.mlb.inverse_transform(predictions)
        
        
        
        return list(predicted_labels[0])
