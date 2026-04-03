import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModel
import spacy
import re
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from nltk.tokenize import sent_tokenize
import nltk

# Fallback sentence tokenizer
def robust_sent_tokenize(text):
    try:
        return sent_tokenize(text)
    except:
        # Simple regex based fallback: split by . ! ? followed by space and capital letter or end of string
        return re.split(r'(?<=[.!?])\s+', text)

class FinancialSummarizer:
    def __init__(self, model_name="ProsusAI/finbert"):
        print(f"Loading {model_name}...")
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModel.from_pretrained(model_name)
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except:
            print("Warning: spaCy model 'en_core_web_sm' not found. NER boosting will be limited.")
            self.nlp = None
        
    def _mean_pooling(self, model_output, attention_mask):
        token_embeddings = model_output[0]
        input_mask_expanded = attention_mask.unsqueeze(-1).expand(token_embeddings.size()).float()
        return torch.sum(token_embeddings * input_mask_expanded, 1) / torch.clamp(input_mask_expanded.sum(1), min=1e-9)

    def get_embeddings(self, sentences):
        encoded_input = self.tokenizer(sentences, padding=True, truncation=True, return_tensors='pt')
        with torch.no_grad():
            model_output = self.model(**encoded_input)
        
        sentence_embeddings = self._mean_pooling(model_output, encoded_input['attention_mask'])
        return F.normalize(sentence_embeddings, p=2, dim=1)

    def calculate_entity_boost(self, sentences):
        """
        Boost ranking for ticker symbols, monetary values, and central bank keywords.
        """
        boosts = []
        ticker_pattern = re.compile(r'\$[A-Z]+')
        money_pattern = re.compile(r'\$?\d+(?:\.\d+)?\s*(?:billion|million|trillion|m|b|k)?')
        central_bank_keywords = ["Fed", "ECB", "BOE", "Interest Rate", "Inflation", "Hawkish", "Bullish", "Bearish", "FOMC"]

        for sentence in sentences:
            score = 1.0
            
            # Ticker boosting
            if ticker_pattern.search(sentence):
                score += 0.5
            
            # Monetary values boosting
            if money_pattern.search(sentence):
                score += 0.4
                
            # Central bank and jargon boosting
            for kw in central_bank_keywords:
                if kw.lower() in sentence.lower():
                    score += 0.3
                    
            # Entity based boosting (if spacy available)
            if self.nlp:
                doc = self.nlp(sentence)
                for ent in doc.ents:
                    if ent.label_ in ["ORG", "MONEY", "PERCENT", "CARDINAL"]:
                        score += 0.1
                    
            boosts.append(score)
        return np.array(boosts)

    def summarize(self, text, num_sentences=4, lambda_mmr=0.6):
        if not text:
            return []

        # 1. Tokenize sentences
        sentences = sent_tokenize(text)
        if len(sentences) <= num_sentences:
            return sentences

        # 2. Generate embeddings
        embeddings = self.get_embeddings(sentences).numpy()
        
        # 3. Document global embedding (average of all sentences)
        doc_embedding = np.mean(embeddings, axis=0).reshape(1, -1)
        
        # 4. Centrality Score (Cosine Similarity with global doc)
        centrality_scores = cosine_similarity(embeddings, doc_embedding).flatten()
        
        # 5. Entity Boost
        boost_scores = self.calculate_entity_boost(sentences)
        
        # Total base importance score
        final_scores = centrality_scores * boost_scores
        
        # 6. MMR (Maximal Marginal Relevance) for redundancy filtering
        summary_indices = []
        candidate_indices = list(range(len(sentences)))
        
        # Select first sentence based on highest final score
        first_idx = np.argmax(final_scores)
        summary_indices.append(first_idx)
        candidate_indices.remove(first_idx)
        
        while len(summary_indices) < num_sentences and candidate_indices:
            mmr_scores = []
            for candidate_idx in candidate_indices:
                # Similarity to document (relevance)
                relevance = final_scores[candidate_idx]
                
                # Similarity to already selected sentences (redundancy)
                selected_embeddings = embeddings[summary_indices]
                redundancy = np.max(cosine_similarity(embeddings[candidate_idx].reshape(1, -1), selected_embeddings))
                
                # MMR formula: lambda * Relevance - (1 - lambda) * Redundancy
                mmr_score = lambda_mmr * relevance - (1 - lambda_mmr) * redundancy
                mmr_scores.append(mmr_score)
            
            best_mmr_idx = candidate_indices[np.argmax(mmr_scores)]
            summary_indices.append(best_mmr_idx)
            candidate_indices.remove(best_mmr_idx)
            
        # Sort back to original order for reading flow
        summary_indices.sort()
        summary = [sentences[i].strip() for i in summary_indices]
        
        return summary

if __name__ == "__main__":
    # Test block
    test_text = """
    $TSLA reported earnings per share of $1.50, beating expectations of $1.20 as interest rates remain a concern for the Fed. 
    Elon Musk noted that the supply chain is improving. 
    The company projects a 50% growth rate in 2024. 
    Interest rates are still high, and the Fed is watching inflation closely.
    Global markets showed signs of volatility today. 
    Apple ($AAPL) also released news regarding its new headset.
    The Fed has suggested a hawkish stance on future rate hikes.
    """
    engine = FinancialSummarizer()
    print("\n--- Executive Briefing ---")
    for s in engine.summarize(test_text):
        print(f"• {s}")
