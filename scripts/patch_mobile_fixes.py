import os

def patch_file(filepath, target, replacement):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # normalize both \r\n and \n
    if target in content:
        content = content.replace(target, replacement, 1)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Patched {filepath} successfully.")
        return True
    else:
        # try normalizing line endings
        target_norm = target.replace('\r\n', '\n')
        content_norm = content.replace('\r\n', '\n')
        if target_norm in content_norm:
            content_norm = content_norm.replace(target_norm, replacement.replace('\r\n', '\n'), 1)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content_norm)
            print(f"Patched {filepath} (normalized line endings) successfully.")
            return True
        else:
            print(f"Target NOT found in {filepath}")
            return False

# 1. Patch home.html:
home_path = os.path.join("client", "student", "home.html")
target_home = """          <p class="resume-desc" id="resumeDesc">
            Resume your titration practical: master step-by-step meniscus alignment, indicator color shifts, and concordancy within &plusmn;0.20 cm&sup3;.
          </p>"""
rep_home = """          <p class="resume-desc" id="resumeDesc">
            Resume your titration practical: master step-by-step meniscus alignment, indicator color shifts, and concordancy within &plusmn;0.10 cm&sup3;.
          </p>"""
patch_file(home_path, target_home, rep_home)

# 2. Add has-bottom-nav class to body in home.html if not present
patch_file(home_path, "<body>", '<body class="has-bottom-nav">')
