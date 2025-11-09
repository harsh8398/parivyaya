import base64

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI

from app.models import TransactionList
from app.settings import get_settings

settings = get_settings()

# System prompt for transaction extraction
TRANSACTION_EXTRACTION_PROMPT = """You are a financial transaction extraction expert. 
Your task is to analyze bank statements, receipts, or invoices and extract ALL transactions in strict JSON format.

For each transaction, you must:
1. Extract the date in YYYY-MM-DD format (must be a past date)
2. Extract the transaction title/description
3. Extract the amount (positive for expenses/debits, negative for income/credits)
4. Assign currency (default: CAD)
5. Categorize into PRIMARY category (first-level classification)
6. Categorize into DETAILED category (second-level classification)
7. Assign confidence level: LOW, MEDIUM, HIGH, or VERY_HIGH based on how clear the categorization is

CATEGORY SYSTEM - TWO LEVELS:

PRIMARY CATEGORIES (category_primary):
- "Essential" - Necessary expenses, income, investments, liabilities
- "Luxury" - Non-essential lifestyle and entertainment expenses
- "N/A" - Account transfers and movements (not real income/expense)
- "Unclassified" - When you cannot determine the category

DETAILED CATEGORIES (category_detailed) - MUST match one of these exact values:

ESSENTIAL DETAILED CATEGORIES:
- "Family Support" (remittances, family financial support)
- "Groceries" (food shopping)
- "Rent" (housing rent)
- "Utilities" (wifi, hydro, phone bills)
- "Immigration" (immigration fees, tests)
- "Health" (medical, supplements, gym)
- "Home" (furniture, household items)
- "Personal Development" (courses, books, education)
- "Personal Care" (toiletries, haircut, grooming)
- "Transportation" (bus pass, fuel, car rental)
- "Stationary" (pens, notebooks, office supplies)
- "Investment" (RRSP, TFSA, ETF, stocks, crypto)
- "Liabilities" (loan, mortgage, tax payments)
- "Miscellaneous" (e-transfers, cash withdrawals)
- "Income" (salary, pay, refunds, returns)

LUXURY DETAILED CATEGORIES:
- "Dine out" (restaurants, fast food)
- "Travel" (flights, hotels, vacation)
- "Shopping" (clothing, accessories, non-essentials)
- "Home+" (entertainment electronics, luxury home items)
- "Subscriptions" (streaming, cloud services)
- "Gifts" (presents for others)
- "Recreational" (movies, entertainment, events)

N/A DETAILED CATEGORIES:
- "Transfers" (between accounts, credit card payments, network fees)

FALLBACK:
- "Unclassified" (when unclear) - use primary: "Unclassified", detailed: "Unclassified"

CRITICAL RULES:
1. PRIMARY and DETAILED categories are DIFFERENT fields - never mix them up
2. PRIMARY must be ONLY: "Essential", "Luxury", "N/A", or "Unclassified"
3. DETAILED must be ONLY one of the specific categories listed above
4. Match the DETAILED category to the correct PRIMARY:
   - Essential detailed categories → primary: "Essential"
   - Luxury detailed categories → primary: "Luxury"
   - Transfers → primary: "N/A"
   - Unclassified → primary: "Unclassified"

EXTRACTION REQUIREMENTS:
- Extract ALL transactions from the document, maintaining the original order
- Pay attention to tables, columns, and formatting in the PDF
- Handle multi-column layouts and complex table structures
- Return ONLY valid JSON in the specified format
- Dates must be in YYYY-MM-DD format and must be past dates
- Amounts should be positive for expenses, negative for income"""


class GeminiWorker:
    """Worker class for Gemini Flash 2.5 with LangChain"""

    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash-exp",
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.1,  # Lower temperature for more consistent structured output
        )
        self.parser = StrOutputParser()
        self.chain = self.llm | self.parser

    async def extract_transactions_from_pdf(self, pdf_bytes: bytes) -> TransactionList:
        """
        Extract transactions directly from PDF bytes using Gemini's native PDF support

        Args:
            pdf_bytes: PDF file content as bytes

        Returns:
            TransactionList with extracted transactions
        """
        # Use structured output with Pydantic model
        structured_llm = self.llm.with_structured_output(TransactionList)

        # Encode PDF as base64 for Gemini
        pdf_base64 = base64.b64encode(pdf_bytes).decode("utf-8")

        # Create message with PDF inline data
        messages = [
            SystemMessage(content=TRANSACTION_EXTRACTION_PROMPT),
            HumanMessage(
                content=[
                    {
                        "type": "text",
                        "text": "Extract all transactions from this PDF document. Pay close attention to tables, columns, and formatting.",
                    },
                    {
                        "type": "media",
                        "mime_type": "application/pdf",
                        "data": pdf_base64,
                    },
                ]
            ),
        ]

        result = await structured_llm.ainvoke(messages)
        return result

    def extract_transactions_from_pdf_sync(self, pdf_bytes: bytes) -> TransactionList:
        """
        Synchronous version of extract_transactions_from_pdf

        Args:
            pdf_bytes: PDF file content as bytes

        Returns:
            TransactionList with extracted transactions
        """
        structured_llm = self.llm.with_structured_output(TransactionList)

        pdf_base64 = base64.b64encode(pdf_bytes).decode("utf-8")

        messages = [
            SystemMessage(content=TRANSACTION_EXTRACTION_PROMPT),
            HumanMessage(
                content=[
                    {
                        "type": "text",
                        "text": "Extract all transactions from this PDF document. Pay close attention to tables, columns, and formatting.",
                    },
                    {
                        "type": "media",
                        "mime_type": "application/pdf",
                        "data": pdf_base64,
                    },
                ]
            ),
        ]

        result = structured_llm.invoke(messages)
        return result
