---
title: "Building a Smarter FAQ Bot (with Gemini, RAG, and Structured Output)"
date: 2025-04-20T10:00:00+05:00
draft: false
tags:
  [
    "FAQ Bot",
    "RAG",
    "Retrieval Augmented Generation",
    "Gemini API",
    "ChromaDB",
    "Embeddings",
    "Structured Output",
    "Vector Store",
    "Python",
    "AI Agents",
  ]
showComments: true
cover:
  image: "/assets/faq-bot.jpg"
  alt: "Intelligent FAQ Bot"
  caption: "Creating a reliable Q&A system using Retrieval Augmented Generation and Google's Gemini API. Photo by Pixabay: https://www.pexels.com/photo/white-robot-on-grey-surface-3861958/"
  relative: false
---

<div style="text-align: justify;">
  <h2><span style="color:#FFB4A2">Introduction</span></h2>

  <div style="text-align: justify;">
    If you've ever found yourself digging through product manuals, company
    wikis, or lengthy documents just to find a simple answer, you know the pain.
    The fact you're reading this suggests you're interested in how
    <strong>Generative AI</strong> can make that process less painful. Stick
    around for a few minutes, and I'll walk you through how we built a smarter
    FAQ bot using Google's Gemini API, Retrieval Augmented Generation (RAG), and
    structured output. This isn't just another chatbot; it's designed to give
    <strong>reliable, context-aware answers</strong> based <em>only</em> on
    provided information, minimizing the risk of making things up
    (hallucination). This example uses Google Car manuals, but the principles
    apply anywhere you have a set of documents you need to query effectively.
    I'm sharing my journey building this; it's a practical demonstration, not a
    definitive guide, so adapt the ideas to your needs!
  </div>

  <hr />

  <h2>
    <span style="color:#FFB4A2"
      >The Problem: Dumb Bots and Information Overload</span
    >
  </h2>

  <p>
    Traditional search methods or basic chatbots often fall short when dealing
    with specific document sets:
  </p>

  <ul>
    <li>
      <strong><span style="color:#8ac7db">Information Overload:</span></strong>
      Manually searching large documents is time-consuming and inefficient.
    </li>
    <li>
      <strong
        ><span style="color:#8ac7db">Generic LLM Limitations:</span></strong
      >
      Large Language Models (LLMs) are powerful, but they lack specific,
      up-to-date knowledge about <em>your</em> documents unless explicitly
      trained on them (which is often impractical).
    </li>
    <li>
      <strong><span style="color:#8ac7db">Hallucination Risk:</span></strong>
      When asked about information outside their training data, LLMs might
      confidently invent answers that sound plausible but are incorrect. This is
      unacceptable for reliable FAQ systems.
    </li>
    <li>
      <strong><span style="color:#8ac7db">Inconsistent Outputs:</span></strong>
      Getting answers in a usable, predictable format can be challenging with
      free-form text generation.
    </li>
  </ul>

  <p>
    We need a system that answers questions accurately based <em>only</em> on a
    given set of documents and provides answers in a consistent, structured way.
  </p>

  <hr />

  <h2><span style="color:#FFB4A2">The Solution: RAG + Gemini API</span></h2>

  <div style="text-align: justify;">
    Our approach combines
    <strong>Retrieval Augmented Generation (RAG)</strong> with the capabilities
    of the <strong>Gemini API</strong>. At a high level, the user interacts with
    the system like this:
  </div>

  <figure style="text-align: center;">
    <img
      src="/assets/RAG-Flow.webp"
      alt="High-Level RAG Flow Diagram: User Query -> RAG System -> Grounded Answer"
      style="max-width: 80%; height: auto; margin: 1em auto; display: block;"
    />
    <figcaption>Figure 1: High-Level RAG Interaction Flow.</figcaption>
  </figure>

  <div style="text-align: justify;">
    This involves three main steps in the underlying RAG pipeline:
    <br /><br />
    1. <strong><span style="color:#8ac7db">Indexing:</span></strong> Convert the
    source documents (Google Car manuals) into numerical representations
    (embeddings) using the Gemini <code>text-embedding-004</code> model and
    store them in a vector database (ChromaDB). This allows for efficient
    similarity searches. This setup process is crucial for enabling fast
    retrieval later.
  </div>

  <figure style="text-align: center;">
    <img
      src="/assets/Indexing-Flow.webp"
      alt="Indexing Flow Diagram: Documents -> Gemini Embedding -> Vector Embeddings -> ChromaDB Vector Store"
      style="max-width: 80%; height: auto; margin: 1em auto; display: block;"
    />
    <figcaption>Figure 2: The Document Indexing Flow.</figcaption>
  </figure>

  <div style="text-align: justify;">
    2. <strong><span style="color:#8ac7db">Retrieval:</span></strong> When a
    user asks a question, embed the question using the same model and search the
    vector database to find the most relevant document chunks based on semantic
    similarity.
  </div>

  <figure style="text-align: center;">
    <img
      src="/assets/Retreival Flow.webp"
      alt="Retrieval Flow Diagram: User Query -> Gemini Embedding -> Query Vector -> ChromaDB -> Relevant Document Chunks"
      style="max-width: 80%; height: auto; margin: 1em auto; display: block;"
    />
    <figcaption>Figure 3: The Query Retrieval Flow.</figcaption>
  </figure>

  <div style="text-align: justify;">
    3. <strong><span style="color:#8ac7db">Generation:</span></strong> Pass the
    original question and the retrieved document chunks as context to a powerful
    LLM (like <code>gemini-2.0-flash</code>). Instruct the model to answer the
    question <em>based only on the provided context</em>. <br /><br />
    Alongside the RAG structure, we leverage specific
    <strong>Gemini API Features</strong>:
    <ul>
      <li>
        <strong
          ><span style="color:#8ac7db">High-Quality Embeddings:</span></strong
        >
        <code>text-embedding-004</code> provides embeddings suitable for finding
        semantically similar text.
      </li>
      <li>
        <strong><span style="color:#8ac7db">Powerful Generation:</span></strong>
        <code>gemini-2.0-flash</code> can synthesize answers based on the
        retrieved context.
      </li>
      <li>
        <strong
          ><span style="color:#8ac7db"
            >Structured Output (JSON Mode):</span
          ></strong
        >
        We instruct Gemini to return the answer and a confidence score in a
        predictable JSON format, making it easy for applications to use the
        output.
      </li>
      <li>
        <strong><span style="color:#8ac7db">Optional Grounding:</span></strong>
        We can even add Google Search as a tool if the local documents don't
        suffice (though our primary goal here is document-based Q&A).
      </li>
    </ul>
  </div>

  <hr />

  <h2><span style="color:#FFB4A2">Implementation Highlights</span></h2>

  <p>
    <strong
      >1.
      <span style="color:#8ac7db"
        >Custom Embedding Function for ChromaDB:</span
      ></strong
    ><br />
    We need to tell ChromaDB how to generate embeddings using the Gemini API.
  </p>

```python # --- 4. Define Gemini Embedding Function for ChromaDB --- from
chromadb import Documents, EmbeddingFunction, Embeddings from google.api_core
import retry from google import genai from google.genai import types
is_retriable = lambda e: (isinstance(e, genai.errors.APIError) and e.code in
{429, 503}) class GeminiEmbeddingFunction(EmbeddingFunction): document_mode =
True # Toggle between indexing docs and embedding queries
@retry.Retry(predicate=is_retriable) def __call__(self, input_texts:
Documents) -> Embeddings: task = "retrieval_document" if self.document_mode
else "retrieval_query" print(f"Embedding {'documents' if self.document_mode
else 'query'} ({len(input_texts)})...") try: # Assuming 'client' is
initialized Google GenAI client response = client.models.embed_content(
model="models/text-embedding-004", contents=input_texts,
config=types.EmbedContentConfig(task_type=task), # Specify task type ) return
[e.values for e in response.embeddings] except Exception as e: print(f"Error
during embedding: {e}") return [[] for _ in input_texts]
</div>
```

<p><strong>2. <span style="color:#8ac7db">Setting up ChromaDB and Indexing:</span></strong><br>
We create a ChromaDB collection and add our documents. <code>get_or_create_collection</code> makes this idempotent.</p>

```python
# --- 5. Setup ChromaDB Vector Store ---
import chromadb
import time

print("Setting up ChromaDB...")
DB_NAME = "googlecar_faq_db"
embed_fn = GeminiEmbeddingFunction()
chroma_client = chromadb.Client()  # In-memory client

try:
    db = chroma_client.get_or_create_collection(name=DB_NAME, embedding_function=embed_fn)
    print(f"Collection '{DB_NAME}' ready. Current count: {db.count()}")
    # Assuming 'documents' and 'doc_ids' are defined earlier
    if db.count() < len(documents):
        print(f"Adding/Updating documents in '{DB_NAME}'...")
        embed_fn.document_mode = True  # Set mode for indexing
        db.upsert(documents=documents, ids=doc_ids)  # Use upsert for safety
        time.sleep(2)  # Allow indexing to settle
        print(f"Documents added/updated. New count: {db.count()}")
    else:
        print("Documents already seem to be indexed.")
except Exception as e:
    print(f"Error setting up ChromaDB collection: {e}")
    raise SystemExit("ChromaDB setup failed. Exiting.")
```

<p><strong>3. <span style="color:#8ac7db">Retrieving Relevant Documents:</span></strong><br>
This function takes the user query, embeds it (using <code>document_mode=False</code>), and searches ChromaDB.</p>

```python
# --- 6. Define Retrieval Function ---
def retrieve_documents(query: str, n_results: int = 1) -> list[str]:
    print(f"\nRetrieving documents for query: '{query}'")
    embed_fn.document_mode = False  # Switch to query mode
    try:
        results = db.query(query_texts=[query], n_results=n_results)
        if results and results.get("documents"):
            retrieved_docs = results["documents"][0]
            print(f"Retrieved {len(retrieved_docs)} documents.")
            return retrieved_docs
        else:
            print("No documents retrieved.")
            return []
    except Exception as e:
        print(f"Error querying ChromaDB: {e}")
        return []
```

<p><strong>4. <span style="color:#8ac7db">Generating the Structured Answer:</span></strong><br>
Here's the core logic combining the query, retrieved context, and instructions for the LLM, specifying JSON output with a confidence score.</p>

```python
# --- 7. Define Structured Output Schema ---
from typing_extensions import Literal
from pydantic import BaseModel

class AnswerWithConfidence(BaseModel):
    answer: str
    confidence: Literal["High", "Medium", "Low"]

# --- 8. Define Augmented Generation Function ---
def generate_structured_answer(query: str, context_docs: list[str]) -> dict | None:
    if not context_docs:
        print("No context provided, cannot generate answer.")
        return {
            "answer": "I couldn't find relevant information in the provided documents to answer this question.",
            "confidence": "Low",
        }

    context = "\n---\n".join(context_docs)

    prompt = f\"\"\"You are an AI assistant answering questions about a Google car based ONLY on the provided documents.
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
{
  "answer": "Your answer here.",
  "confidence": "High/Medium/Low"
}
\"\"\"
    try:
        generation_config = types.GenerateContentConfig(
            temperature=0.2,
            response_mime_type="application/json",  # Request JSON
            response_schema=AnswerWithConfidence,  # Provide the schema
        )
        # Assuming 'client' is initialized Google GenAI client
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
            generation_config=generation_config,  # Pass the config object
        )

        # Safe access to parsed output
        if (
            response.candidates
            and response.candidates[0].content
            and response.candidates[0].content.parts
        ):
            parsed_output = response.candidates[0].content.parts[0].function_call
            # Fallback check if .parsed is used
            if not parsed_output and hasattr(
                response.candidates[0].content.parts[0], "parsed"
            ):
                parsed_output = response.candidates[0].content.parts[0].parsed

            if isinstance(parsed_output, dict) and "answer" in parsed_output and "confidence" in parsed_output:
                print("Generated Answer:", parsed_output)
                return parsed_output
            else:
                print("Warning: Could not extract valid JSON from response.")
                print("Raw response part:", response.candidates[0].content.parts[0])
                # Attempt to parse the text part if it exists and looks like JSON
                try:
                    import json

                    text_part = response.candidates[0].content.parts[0].text
                    if text_part and text_part.strip().startswith("{") and text_part.strip().endswith("}"):
                        parsed_json = json.loads(text_part)
                        if isinstance(parsed_json, dict) and "answer" in parsed_json and "confidence" in parsed_json:
                            print("Recovered JSON from text part:", parsed_json)
                            return parsed_json
                except Exception as json_e:
                    print(f"Could not parse text part as JSON: {json_e}")

        print("Error: Could not generate/parse structured response correctly.")
        return {"answer": "Error: Could not generate or parse the structured response from the AI.", "confidence": "Low"}

    except Exception as e:
        print(f"Error during content generation call: {e}")
        return {"answer": f"Error during generation API call: {e}", "confidence": "Low"}
```

<blockquote>
<strong>Tip:</strong> Ensure your API key is correctly set up in Kaggle Secrets (<code>GOOGLE_API_KEY</code>). Also, ChromaDB setup might require specific permissions or setup depending on the environment (here we use an in-memory one for simplicity).
</blockquote>

<hr>

<h2><span style="color:#FFB4A2">Limitations and Future Work</span></h2>

<p>This implementation is a great starting point, but it has limitations:</p>

<ul>
  <li><strong><span style="color:#8ac7db">Document Quality:</span></strong> The RAG system's effectiveness heavily depends on the quality, relevance, and comprehensiveness of the indexed documents. Garbage in, garbage out.</li>
  <li><strong><span style="color:#8ac7db">Retrieval Accuracy:</span></strong> Simple similarity search might not always retrieve the <em>perfect</em> chunk of text, especially for complex queries. More advanced retrieval strategies (like hybrid search or re-ranking) could improve this.</li>
  <li><strong><span style="color:#8ac7db">Structured Output Failures:</span></strong> While JSON mode is robust, the LLM might occasionally fail to generate perfectly valid JSON matching the schema. More robust error handling and potentially retries could be added.</li>
  <li><strong><span style="color:#8ac7db">Limited Context Handling (within LLM):</span></strong> While RAG provides context, the LLM itself still has limits on how much context it can process <em>effectively</em> in a single generation step. Very long retrieved passages might need summarization or chunking before being sent to the LLM.</li>
  <li><strong><span style="color:#8ac7db">Static Knowledge:</span></strong> The bot only knows what's in the ChromaDB index. It doesn't learn automatically. Updates require re-indexing.</li>
</ul>

<h3><span style="color:#FFB4A2">Future Enhancements:</span></h3>

<ul>
  <li>Implement Google Search grounding as a fallback when confidence is low or documents are missing.</li>
  <li>Add conversation memory for multi-turn interactions.</li>
  <li>Explore more sophisticated retrieval techniques.</li>
  <li>Build a simple UI (e.g., using Gradio or Streamlit).</li>
  <li>Fine-tune an embedding model specifically for the car manual domain (though <code>text-embedding-004</code> is quite capable).</li>
</ul>

<hr>

<h2><span style="color:#FFB4A2">Conclusion</span></h2>

<div style="text-align: justify;">
Building this FAQ bot demonstrates how combining RAG with Gemini's embedding and generation capabilities, especially its structured output mode, can create powerful and <strong>reliable</strong> AI-driven Q&A systems. By grounding the LLM's responses in specific source documents and requesting a confidence score, we significantly mitigate hallucination and provide a more trustworthy user experience.
</div>

<p><strong>Key Takeaways:</strong></p>
<ul>
  <li><strong><span style="color:#8ac7db">RAG</span></strong> grounds LLM answers in your specific data.</li>
  <li><strong><span style="color:#8ac7db">Gemini Embeddings + ChromaDB</span></strong> enable efficient document retrieval.</li>
  <li><strong><span style="color:#8ac7db">Structured Output (JSON Mode)</span></strong> enhances reliability and integrability.</li>
  <li><strong><span style="color:#8ac7db">Confidence Scores</span></strong> add a layer of trustworthiness.</li>
</ul>

<div style="text-align: justify;">
This approach is versatile and can be adapted for various knowledge bases, from customer support FAQs to internal documentation search.

I hope this walkthrough provides a clear picture of how this smarter FAQ bot works! Feel free to <strong>ask questions</strong> or <strong>leave a comment</strong> with your thoughts or own implementations!

</div>

</div>
