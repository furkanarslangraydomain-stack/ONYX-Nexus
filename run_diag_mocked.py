import sys
from unittest.mock import MagicMock

# Mocking all dependencies
class MockModule(MagicMock): pass

sys.modules['fastapi'] = MockModule()
sys.modules['fastapi.responses'] = MockModule()
sys.modules['fastapi.middleware'] = MockModule()
sys.modules['fastapi.middleware.cors'] = MockModule()
sys.modules['uvicorn'] = MockModule()
sys.modules['httpx'] = MagicMock(Limits=MagicMock())
sys.modules['litellm'] = MockModule()
sys.modules['psutil'] = MockModule()
sys.modules['sentence_transformers'] = MockModule()
sys.modules['pydantic'] = MockModule()
sys.modules['e2b_code_interpreter'] = MockModule()

import system_diagnostic
import asyncio

async def test():
    # Patch main and notion methods
    system_diagnostic.test_llm_api = MagicMock(return_value=asyncio.sleep(0))
    system_diagnostic.test_notion_integration = MagicMock(return_value=asyncio.sleep(0))
    
    # We just run the raw module logic
    await system_diagnostic.run_all_tests()

if __name__ == "__main__":
    asyncio.run(test())
