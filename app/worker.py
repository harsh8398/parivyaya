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
5. Categorize into primary category: ESSENTIAL, LUXURY, INVESTMENTS, or UNCLASSIFIED
6. Categorize into detailed category from: Family Support, Groceries, Rent, Utilities, Immigration, Health, Home, Personal Development, Personal Care, Transportation, Stationary, Dine out, Travel, Shopping, Home+, Subscriptions, Gifts, Recreational, Investment, Liabilities, Miscellaneous, Income, Transfers, Unclassified
7. Assign confidence level: LOW, MEDIUM, HIGH, or VERY_HIGH based on how clear the categorization is

IMPORTANT:
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
