# ALPHA SIGNAL v2.0: Financial Intelligence Summarizer

Alpha Signal is a professional-grade financial intelligence platform designed to transform dense market reports, SEC filings, and news articles into high-impact "Executive Briefings." By combining finance-tuned transformer models with custom heuristic ranking, the system identifies the most critical "alpha" signals within any volume of financial text.

## 🚀 Core Features

- **AI-Powered Extractive Summarization**: Utilizes **FinBERT** (a BERT model pre-trained on financial communication) to generate deep semantic embeddings for every sentence, ensuring context-aware importance scoring.
- **Financial Entity Boosting**: A custom ranking engine that weights sentences higher if they contain:
  - **Tickers & Markets**: Matches like `$TSLA`, `$AAPL`, or `$FTSE`.
  - **Monetary Quantities**: Identifies revenue, debt, and valuation figures (e.g., `$1.5B`, `€500M`).
  - **Macro-Economic Indicators**: Prioritizes statements involving the **Fed**, interest rate changes, inflation data, and hawkish/bearish sentiment.
- **Signal Diversity (MMR)**: Implements **Maximal Marginal Relevance** to filter out redundant information, ensuring every point in the executive summary adds new, unique value.
- **Automated Intelligence Gathering**: Integrated web scraping capabilities that extract and process clean text directly from major financial news outlets like Bloomberg, Reuters, and CNBC.

## 🛠️ Technical Architecture

### **Backend (Python / FastAPI)**
- **Model Layer**: `transformers` (FinBERT), `torch`.
- **NLP Pipeline**: `spaCy` for Named Entity Recognition (NER) and `nltk` for robust sentence tokenization.
- **Scraping Engine**: `BeautifulSoup4` and `requests` with browser-mimicking headers for reliable content extraction.
- **Logic**: Custom `FinancialSummarizer` class that combines cosine similarity (centrality) with entity-weighting.

### **Frontend (React / Vite)**
- **UI/UX**: Single-page application with a high-density "Bloomberg Terminal" aesthetic.
- **Design System**: Custom CSS implementing **Glassmorphism**, dark mode optimization, and high-contrast financial data visualization.
- **Icons**: `lucide-react` for modern, clean iconography.

---

## 📈 Intended Use Case
This platform is built for financial analysts, portofolio managers, and traders who need to digest thousands of words of market data rapidly without missing critical quantitative facts or monetary movements.
