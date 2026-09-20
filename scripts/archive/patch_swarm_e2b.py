import re
import os

with open("swarm_engine.py", "r") as f:
    content = f.read()

# Sandbox executor modification
e2b_logic = """
def execute_in_sandbox(code):
    \"\"\"
    Kodu izole bir alanda (sandbox) test eder.
    Eğer sistemde E2B_API_KEY tanımlıysa Cloud Sandbox (E2B) kullanır, 
    değilse yerel (Local Subprocess) Fallback kullanır.
    \"\"\"
    e2b_key = os.environ.get("E2B_API_KEY")
    if e2b_key:
        try:
            from e2b_code_interpreter import Sandbox
            with Sandbox(api_key=e2b_key) as sandbox:
                execution = sandbox.run_code(code, timeout=15)
                out_msg = f"--- E2B CLOUD SANDBOX ÇALIŞTIRMA SONUCU ---\\n"
                
                if execution.logs.stdout:
                    out_msg += f"Çıktı (Stdout):\\n{''.join(execution.logs.stdout)[:500]}\\n"
                if execution.error:
                    out_msg += f"Hata (Stderr) - LÜTFEN BUNU DÜZELT:\\n{execution.error.name}: {execution.error.value}\\n"
                return out_msg
        except ImportError:
            return "HATA: E2B kütüphanesi yüklü değil. Lütfen 'pip install e2b_code_interpreter' çalıştırın."
        except Exception as e:
            return f"E2B Cloud Hatası: {str(e)}"
            
    # LOCAL FALLBACK (Eğer E2B Key yoksa Subprocess ile çalıştır)
    try:
        with open("sandbox_temp.py", "w") as f:
            f.write(code)
        res = subprocess.run(
            ["python3", "sandbox_temp.py"], 
            capture_output=True, 
            text=True, 
            timeout=5,
            preexec_fn=set_memory_limit if os.name == 'posix' else None
        )
        out_msg = f"--- YEREL KOD ÇALIŞTIRMA (LOCAL SANDBOX) SONUCU ---\\nÇıkış Kodu: {res.returncode}\\nÇıktı (Stdout):\\n{res.stdout[:500]}\\n"
        if res.stderr:
            out_msg += f"Hata (Stderr) - LÜTFEN BUNU DÜZELT:\\n{res.stderr[:500]}"
        return out_msg
    except subprocess.TimeoutExpired:
        return "HATA: Kod 5 saniyede tamamlanamadı (Zaman aşımı/Sonsuz döngü). Kodu optimize et."
    except Exception as e:
        return f"Sistem Hatası: {str(e)}"
    finally:
        if os.path.exists("sandbox_temp.py"):
            os.remove("sandbox_temp.py")
"""

# Find existing execute_in_sandbox function
old_sandbox = re.search(r'def execute_in_sandbox.*?finally:.*?os\.remove\("sandbox_temp\.py"\)', content, re.DOTALL)
if old_sandbox:
    content = content.replace(old_sandbox.group(0), e2b_logic.strip())

with open("swarm_engine.py", "w") as f:
    f.write(content)
print("Swarm Engine patched with E2B Support.")
