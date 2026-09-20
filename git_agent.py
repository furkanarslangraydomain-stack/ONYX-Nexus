import os
import subprocess
import logging

logger = logging.getLogger(__name__)

class AutoGitAgent:
    """
    Otonom CI/CD ve Git Yönetim Modülü.
    Ajanların yazdıkları kodları otomatik olarak commit edip pushlamasını sağlar.
    GITHUB_TOKEN veya GH_TOKEN ortam değişkeni sağlandığında otomatik yetkilendirme ile push yapar.
    """
    def __init__(self, default_branch="main", repo_url="https://github.com/furkanarslangraydomain-stack/ONYX-Nexus.git"):
        self.default_branch = default_branch
        self.repo_url = repo_url

    def execute_command(self, cmd: list) -> str:
        try:
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=20)
            if res.returncode == 0:
                return f"BAŞARILI: {' '.join(cmd)}\n{res.stdout.strip()}"
            else:
                return f"HATA: {' '.join(cmd)}\n{res.stderr.strip()}"
        except Exception as e:
            return f"Sistem Hatası (Git): {str(e)}"

    def get_authenticated_url(self) -> str:
        token = os.getenv("GITHUB_TOKEN") or os.getenv("GH_TOKEN") or os.getenv("GIT_TOKEN")
        if token:
            clean = self.repo_url.replace("https://", "")
            if "@" in clean:
                clean = clean.split("@")[-1]
            return f"https://{token}@{clean}"
        return self.repo_url

    def auto_commit_and_push(self, commit_message: str, new_branch: str = None) -> dict:
        logs = []
        
        # 1. Config User
        self.execute_command(["git", "config", "user.name", "furkanarslangray"])
        self.execute_command(["git", "config", "user.email", "furkanarslangray@gmail.com"])

        # 2. Status & Add
        add_res = self.execute_command(["git", "add", "."])
        logs.append(add_res)

        # 3. Branch
        branch = new_branch if new_branch else self.default_branch
        self.execute_command(["git", "branch", "-M", branch])

        # 4. Commit
        commit_res = self.execute_command(["git", "commit", "-m", commit_message])
        logs.append(commit_res)

        # 5. Remote Configuration & Push
        token = os.getenv("GITHUB_TOKEN") or os.getenv("GH_TOKEN") or os.getenv("GIT_TOKEN")
        remote_url = self.get_authenticated_url()

        # Update remote origin
        self.execute_command(["git", "remote", "set-url", "origin", remote_url])

        if not token:
            return {
                "success": False,
                "pushed": False,
                "reason": "GITHUB_TOKEN bulunamadı. Lütfen repo push işlemi için GITHUB_TOKEN (Personal Access Token) tanımlayın.",
                "logs": "\n".join(logs),
                "commit_created": "BAŞARILI" in commit_res or "nothing to commit" in commit_res
            }

        push_res = self.execute_command(["git", "push", "-u", "origin", branch])
        logs.append(push_res)
        is_success = "BAŞARILI" in push_res or "Everything up-to-date" in push_res

        return {
            "success": is_success,
            "pushed": is_success,
            "branch": branch,
            "logs": "\n".join(logs)
        }

if __name__ == "__main__":
    agent = AutoGitAgent()
    result = agent.auto_commit_and_push("test commit")
    print(result)

