import subprocess
import logging

logger = logging.getLogger(__name__)

class AutoGitAgent:
    """
    Otonom CI/CD ve Git Yönetim Modülü.
    Ajanların yazdıkları kodları otomatik olarak commit edip pushlamasını sağlar.
    """
    def __init__(self, default_branch="main"):
        self.default_branch = default_branch

    def execute_command(self, cmd: list) -> str:
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
            if res.returncode == 0:
                return f"BAŞARILI: {' '.join(cmd)}\n{res.stdout}"
            else:
                return f"HATA: {' '.join(cmd)}\n{res.stderr}"
        except Exception as e:
            return f"Sistem Hatası (Git): {str(e)}"

    def auto_commit_and_push(self, commit_message: str, new_branch: str = None) -> str:
        logs = "--- AUTO-GIT (CI/CD) RAPORU ---\n"
        
        # 1. Status & Add
        self.execute_command(["git", "add", "."])
        
        # 2. Branch
        if new_branch:
            logs += self.execute_command(["git", "checkout", "-b", new_branch]) + "\n"
            
        # 3. Commit
        commit_res = self.execute_command(["git", "commit", "-m", commit_message])
        logs += commit_res + "\n"
        
        # 4. Push
        branch_to_push = new_branch if new_branch else self.default_branch
        push_res = self.execute_command(["git", "push", "origin", branch_to_push])
        logs += push_res + "\n"
        
        return logs

if __name__ == "__main__":
    agent = AutoGitAgent()
    print("Git Agent Initialized.")
