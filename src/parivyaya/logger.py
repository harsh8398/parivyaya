import logging
import sys

from parivyaya.settings import get_settings

settings = get_settings()

file_handler = logging.FileHandler(filename="tmp.log")
stdout_handler = logging.StreamHandler(stream=sys.stdout)
handlers = [file_handler, stdout_handler]

logging.basicConfig(
    level=logging.DEBUG,
    format="[%(asctime)s] {%(filename)s:%(lineno)d} %(levelname)s - %(message)s",
    handlers=handlers,
)

logger = logging.getLogger(settings.LOGGER_NAME)
