#!/usr/bin/env python3
"""GitHub API helper using urllib (gh CLI not available in sandbox)."""
import urllib.request
import urllib.parse
import json
import os
import sys

TOKEN = os.environ.get("GH_TOKEN", "")
HEADERS = {
    "Authorization": f"token {TOKEN}",
    "Accept": "application/vnd.github.v3+json",
    "User-Agent": "mavis-cron/1.0"
}

OWNER = "aryandas2911"
REPO = "dailyforge"
FORK_OWNER = "tmdeveloper007"
FORK_REPO = "DailyForge"

def api(method, path, data=None, repo=None):
    if repo == "fork":
        url = f"https://api.github.com/repos/{FORK_OWNER}/{FORK_REPO}{path}"
    else:
        url = f"https://api.github.com/repos/{OWNER}/{REPO}{path}"
    req = urllib.request.Request(url, headers=HEADERS, method=method)
    if data:
        req.add_header("Content-Type", "application/json")
        req.data = json.dumps(data).encode()
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read()), resp.status
    except urllib.request.HTTPError as e:
        body = e.read().decode()
        return {"error": body}, e.code

def get(path, repo=None):
    return api("GET", path, repo=repo)

def post(path, data, repo=None):
    return api("POST", path, data, repo=repo)

def patch(path, data, repo=None):
    return api("PATCH", path, data, repo=repo)

def delete(path, repo=None):
    return api("DELETE", path, repo=repo)

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "help"
    if cmd == "list_prs":
        # Phase 1: list PRs from fork owner
        data, status = get(f"/pulls?state=all&per_page=50&sort=updated&direction=desc")
        if "error" in data:
            print(f"ERROR {status}: {data['error']}")
        else:
            for pr in data:
                print(f"PR #{pr['number']} | {pr['state']} | {pr['title']}")
    elif cmd == "my_prs":
        # PRs authored by tmdeveloper007
        data, status = get(f"/pulls?state=all&per_page=50&sort=updated&direction=desc")
        if "error" in data:
            print(f"ERROR {status}: {data['error']}")
        else:
            mine = [pr for pr in data if pr["user"]["login"] == FORK_OWNER]
            for pr in mine:
                print(f"PR #{pr['number']} | {pr['state']} | {pr['title']} | head={pr['head']['ref']}")
    elif cmd == "list_issues":
        data, status = get("/issues?state=open&per_page=50&sort=updated&direction=desc")
        if "error" in data:
            print(f"ERROR {status}: {data['error']}")
        else:
            for iss in data:
                if not iss.get("pull_request"):
                    print(f"Issue #{iss['number']} | {iss['title']} | assignee={iss.get('assignee')}")
    elif cmd == "fork_check":
        data, status = get("", repo="fork")
        if "error" in data:
            print(f"ERROR {status}: {data['error']}")
        else:
            print(f"Fork exists: {data.get('full_name')} | default_branch={data.get('default_branch')}")
    elif cmd == "branches":
        data, status = get("/git/refs/heads", repo="fork")
        if "error" in data:
            print(f"ERROR {status}: {data['error']}")
        else:
            for b in data:
                print(b["ref"])
    elif cmd == "create_issue":
        title = sys.argv[2]
        body = sys.argv[3]
        data_out, status = post("/issues", {"title": title, "body": body})
        if "error" in data_out:
            print(f"ERROR {status}: {data_out['error']}")
        else:
            print(f"Created issue #{data_out['number']}: {data_out['title']}")
    elif cmd == "create_pr":
        title = sys.argv[2]
        body = sys.argv[3]
        head = sys.argv[4]  # branch name on fork
        base = sys.argv[5]  # main
        data_out, status = post("/pulls", {"title": title, "body": body, "head": f"{FORK_OWNER}:{head}", "base": base})
        if "error" in data_out:
            print(f"ERROR {status}: {data_out['error']}")
        else:
            print(f"Created PR #{data_out['number']}: {data_out['title']}")
            print(f"URL: {data_out['html_url']}")
    elif cmd == "upstream_branches":
        data, status = get("/git/refs/heads")
        if "error" in data:
            print(f"ERROR {status}: {data['error']}")
        else:
            for b in data:
                print(b["ref"])
    elif cmd == "commit_sha":
        ref = sys.argv[2]
        data_out, status = get(f"/git/ref/heads/{urllib.parse.quote(ref)}")
        if "error" in data_out:
            print(f"ERROR {status}: {data_out['error']}")
        else:
            print(data_out.get("object", {}).get("sha", ""))
    else:
        print("Commands: list_prs | my_prs | list_issues | fork_check | branches | upstream_branches | create_issue | create_pr | commit_sha")
