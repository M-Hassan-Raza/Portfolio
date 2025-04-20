---
title: "Building a Smarter FAQ Bot (with Gemini, RAG, and Structured Output)"
date: 2024-08-16T10:00:00+05:00
draft: false
tags: ["FAQ Bot", "RAG", "Retrieval Augmented Generation", "Gemini API", "ChromaDB", "Embeddings", "Structured Output", "Vector Store", "Python", "AI Agents"]
showComments: true
cover:
    image: "/assets/faq-bot-cover.jpg" # Placeholder - replace with an actual image path
    alt: "Intelligent FAQ Bot"
    caption: "Creating a reliable Q&A system using Retrieval Augmented Generation and Google's Gemini API. Photo by Pixabay: https://www.pexels.com/photo/white-robot-on-grey-surface-3861958/"
    relative: false
---

<div style="text-align: justify;">

## <span style="color:#FFB4A2">Introduction</span>

<div style="text-align: justify;">
If you've ever found yourself digging through product manuals, company wikis, or lengthy documents just to find a simple answer, you know the pain. The fact you're reading this suggests you're interested in how **Generative AI** can make that process less painful. Stick around for a few minutes, and I'll walk you through how we built a smarter FAQ bot using Google's Gemini API, Retrieval Augmented Generation (RAG), and structured output. This isn't just another chatbot; it's designed to give **reliable, context-aware answers** based *only* on provided information, minimizing the risk of making things up (hallucination). This example uses Google Car manuals, but the principles apply anywhere you have a set of documents you need to query effectively. I'm sharing my journey building this; it's a practical demonstration, not a definitive guide, so adapt the ideas to your needs!
</div>

---

## <span style="color:#FFB4A2">The Problem: Dumb Bots and Information Overload</span>

Traditional search methods or basic chatbots often fall short when dealing with specific document sets:

-   **<span style="color:#8ac7db">Information Overload:</span>** Manually searching large documents is time-consuming and inefficient.
-   **<span style="color:#8ac7db">Generic LLM Limitations:</span>** Large Language Models (LLMs) are powerful, but they lack specific, up-to-date knowledge about *your* documents unless explicitly trained on them (which is often impractical).
-   **<span style="color:#8ac7db">Hallucination Risk:</span>** When asked about information outside their training data, LLMs might confidently invent answers that sound plausible but are incorrect. This is unacceptable for reliable FAQ systems.
-   **<span style="color:#8ac7db">Inconsistent Outputs:</span>** Getting answers in a usable, predictable format can be challenging with free-form text generation.

We need a system that answers questions accurately based *only* on a given set of documents and provides answers in a consistent, structured way.

---

## <span style="color:#FFB4A2">The Solution: RAG + Gemini API</span>

Our approach combines **Retrieval Augmented Generation (RAG)** with the capabilities of the **Gemini API**:

-   **<span style="color:#8ac7db">RAG Pipeline:</span>** This involves three main steps:
    1.  **Indexing:** Convert the source documents (Google Car manuals) into numerical representations (embeddings) using the Gemini `text-embedding-004` model and store them in a vector database (ChromaDB). This allows for efficient similarity searches.
    2.  **Retrieval:** When a user asks a question, embed the question using the same model and search the vector database to find the most relevant document chunks.
    3.  **Generation:** Pass the original question and the retrieved document chunks as context to a powerful LLM (like `gemini-2.0-flash`). Instruct the model to answer the question *based only on the provided context*.

-   **<span style="color:#8ac7db">Gemini API Features:</span>**
    *   **High-Quality Embeddings:** `text-embedding-004` provides embeddings suitable for finding semantically similar text.
    *   **Powerful Generation:** `gemini-2.0-flash` can synthesize answers based on the retrieved context.
    *   **Structured Output (JSON Mode):** We instruct Gemini to return the answer and a confidence score in a predictable JSON format, making it easy for applications to use the output.
    *   **Optional Grounding:** We can even add Google Search as a tool if the local documents don't suffice (though our primary goal here is document-based Q&A).

---

## <span style="color:#FFB4A2">Implementation Highlights</span>

Here are some key code snippets demonstrating the core components:

**1. <span style="color:#8ac7db">Custom Embedding Function for ChromaDB:</span>**
We need to tell ChromaDB how to generate embeddings using the Gemini API.

```python
# --- 4. Define Gemini Embedding Function for ChromaDB ---
from chromadb import Documents, EmbeddingFunction, Embeddings
from google.api_core import retry
from google import genai
from google.genai import types

is_retriable = lambda e: (isinstance(e, genai.errors.APIError) and e.code in {429, 503})

class GeminiEmbeddingFunction(EmbeddingFunction):
    document_mode = True # Toggle between indexing docs and embedding queries
    @retry.Retry(predicate=is_retriable)
    def __call__(self, input_texts: Documents) -> Embeddings:
        task = "retrieval_document" if self.document_mode else "retrieval_query"
        print(f"Embedding {'documents' if self.document_mode else 'query'} ({len(input_texts)})...")
        try:
            response = client.models.embed_content(
                model="models/text-embedding-004",
                contents=input_texts,
                config=types.EmbedContentConfig(task_type=task), # Specify task type
            )
            return [e.values for e in response.embeddings]
        except Exception as e:
            print(f"Error during embedding: {e}")
            return [[] for _ in input_texts]
```

**2. <span style="color:#8ac7db">Setting up ChromaDB and Indexing:</span>**
We create a ChromaDB collection and add our documents. `get_or_create_collection` makes this idempotent.

```python
# --- 5. Setup ChromaDB Vector Store ---
import chromadb
import time

print("Setting up ChromaDB...")
DB_NAME = "googlecar_faq_db"
embed_fn = GeminiEmbeddingFunction()
chroma_client = chromadb.Client() # In-memory client

try:
    db = chroma_client.get_or_create_collection(name=DB_NAME, embedding_function=embed_fn)
    print(f"Collection '{DB_NAME}' ready. Current count: {db.count()}")
    if db.count() < len(documents):
        print(f"Adding/Updating documents in '{DB_NAME}'...")
        embed_fn.document_mode = True # Set mode for indexing
        db.upsert(documents=documents, ids=doc_ids) # Use upsert for safety
        time.sleep(2) # Allow indexing to settle
        print(f"Documents added/updated. New count: {db.count()}")
    else:
        print("Documents already seem to be indexed.")
except Exception as e:
    print(f"Error setting up ChromaDB collection: {e}")
    raise SystemExit("ChromaDB setup failed. Exiting.")
```

**3. <span style="color:#8ac7db">Retrieving Relevant Documents:</span>**
This function takes the user query, embeds it (using `document_mode=False`), and searches ChromaDB.

```python
# --- 6. Define Retrieval Function ---
def retrieve_documents(query: str, n_results: int = 1) -> list[str]:
    print(f"\nRetrieving documents for query: '{query}'")
    embed_fn.document_mode = False # Switch to query mode
    try:
        results = db.query(query_texts=[query], n_results=n_results)
        if results and results.get('documents'):
            retrieved_docs = results['documents'][0]
            print(f"Retrieved {len(retrieved_docs)} documents.")
            return retrieved_docs
        else:
            print("No documents retrieved.")
            return []
    except Exception as e:
        print(f"Error querying ChromaDB: {e}")
        return []
```

**4. <span style="color:#8ac7db">Generating the Structured Answer:</span>**
Here's the core logic combining the query, retrieved context, and instructions for the LLM, specifying JSON output with a confidence score.

```python
# --- 7. Define Structured Output Schema ---
from typing_extensions import Literal
from pydantic import BaseModel

class AnswerWithConfidence(BaseModel):
    answer: str
    confidence: Literal["High", "Medium", "Low"]

# --- 8. Define Augmented Generation Function ---
def generate_structured_answer(query: str, context_docs: list[str]) -> dict | None:
    # ... (prompt construction as shown previously) ...

    prompt = f"""You are an AI assistant answering questions about a Google car based ONLY on the provided documents.
    Context Documents:
    ---
    {context}
    ---
    Question: {query}
    Based *only* on the information in the context documents above, answer the question.
    Also, assess your confidence in the answer based *only* on the provided text:
    - "High" if the answer is directly and clearly stated in the documents.
    - "Medium" if the answer can be inferred but isn't explicitly stated.
    - "Low" if the documents don't seem to contain the answer or are ambiguous.
    Return your response ONLY as a JSON object with the keys "answer" and "confidence". Example format:
    {{
      "answer": "Your answer here.",
      "confidence": "High/Medium/Low"
    }}
    """
    try:
        generation_config = types.GenerateContentConfig(
            temperature=0.2,
            response_mime_type="application/json", # Request JSON
            response_schema=AnswerWithConfidence # Provide the schema
        )
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            config=generation_config # Pass the config object
        )
        # ... (response handling as shown previously) ...
        # Safe access to parsed output
        if response.candidates and response.candidates[0].content and response.candidates[0].content.parts:
             parsed_output = response.candidates[0].content.parts[0].parsed
             if isinstance(parsed_output, dict) and "answer" in parsed_output and "confidence" in parsed_output:
                 return parsed_output
        # ... (Error handling/logging) ...
        return {"answer": "Error: Could not generate/parse structured response.", "confidence": "Low"}

    except Exception as e:
        print(f"Error during content generation call: {e}")
        return {"answer": f"Error during generation API call: {e}", "confidence": "Low"}

```

> **Tip:** Ensure your API key is correctly set up in Kaggle Secrets (`GOOGLE_API_KEY`). Also, ChromaDB setup might require specific permissions or setup depending on the environment (here we use an in-memory one for simplicity).

---

## <span style="color:#FFB4A2">Why Structured Output and Confidence Scores?</span>

Forcing the LLM to output JSON with a specific schema (using `response_mime_type` and `response_schema`) brings several advantages:

-   **<span style="color:#8ac7db">Reliability:</span>** The output format is predictable, making it easy to integrate into downstream applications without complex text parsing.
-   **<span style="color:#8ac7db">Consistency:</span>** Ensures the bot always provides both the answer and its confidence level.
-   **<span style="color:#8ac7db">Trustworthiness:</span>** The confidence score gives the user (or the calling application) an indication of how much to trust the answer, based on the grounding provided by the retrieved documents. A "Low" confidence answer might trigger a fallback to human support or a broader search.

---

## <span style="color:#FFB4A2">Limitations and Future Work</span>

This implementation is a great starting point, but it has limitations:

-   **<span style="color:#8ac7db">Document Quality:</span>** The RAG system's effectiveness heavily depends on the quality, relevance, and comprehensiveness of the indexed documents. Garbage in, garbage out.
-   **<span style="color:#8ac7db">Retrieval Accuracy:</span>** Simple similarity search might not always retrieve the *perfect* chunk of text, especially for complex queries. More advanced retrieval strategies (like hybrid search or re-ranking) could improve this.
-   **<span style="color:#8ac7db">Structured Output Failures:</span>** While JSON mode is robust, the LLM might occasionally fail to generate perfectly valid JSON matching the schema. More robust error handling and potentially retries could be added.
-   **<span style="color:#8ac7db">Limited Context Handling (within LLM):</span>** While RAG provides context, the LLM itself still has limits on how much context it can process *effectively* in a single generation step. Very long retrieved passages might need summarization or chunking before being sent to the LLM.
-   **<span style="color:#8ac7db">Static Knowledge:</span>** The bot only knows what's in the ChromaDB index. It doesn't learn automatically. Updates require re-indexing.

**Future Enhancements:**

-   Implement Google Search grounding as a fallback when confidence is low or documents are missing.
-   Add conversation memory for multi-turn interactions.
-   Explore more sophisticated retrieval techniques.
-   Build a simple UI (e.g., using Gradio or Streamlit).
-   Fine-tune an embedding model specifically for the car manual domain (though `text-embedding-004` is quite capable).

---

## <span style="color:#FFB4A2">Conclusion</span>

Building this FAQ bot demonstrates how combining RAG with Gemini's embedding and generation capabilities, especially its structured output mode, can create powerful and **reliable** AI-driven Q&A systems. By grounding the LLM's responses in specific source documents and requesting a confidence score, we significantly mitigate hallucination and provide a more trustworthy user experience.

**Key Takeaways:**

-   <strong><span style="color:#8ac7db">RAG</span></strong> grounds LLM answers in your specific data.
-   <strong><span style="color:#8ac7db">Gemini Embeddings + ChromaDB</span></strong> enable efficient document retrieval.
-   <strong><span style="color:#8ac7db">Structured Output (JSON Mode)</span></strong> enhances reliability and integrability.
-   <strong><span style="color:#8ac7db">Confidence Scores</span></strong> add a layer of trustworthiness.

This approach is versatile and can be adapted for various knowledge bases, from customer support FAQs to internal documentation search.

---

I hope this walkthrough provides a clear picture of how this smarter FAQ bot works! Feel free to **ask questions** or **leave a comment** with your thoughts or own implementations!

</div>