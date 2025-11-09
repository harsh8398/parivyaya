import logging
import sys

from app.settings import get_settings

settings = get_settings()

stdout_handler = logging.StreamHandler(stream=sys.stdout)

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] {%(filename)s:%(lineno)d} %(levelname)s - %(message)s",
    handlers=[stdout_handler],
)

logger = logging.getLogger(settings.LOGGER_NAME)
