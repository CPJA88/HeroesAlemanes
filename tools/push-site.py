#!/usr/bin/env python3
"""Push with an ephemeral credential through stdin; no token is stored on disk."""
import json, os, subprocess, sys, termios
from pathlib import Path
root = Path(__file__).resolve().parent.parent
old = None
if sys.stdin.isatty():
    old = termios.tcgetattr(sys.stdin)
    hidden = termios.tcgetattr(sys.stdin)
    hidden[3] &= ~termios.ECHO
    termios.tcsetattr(sys.stdin, termios.TCSANOW, hidden)
try:
    print('READY: esperando credencial efímera por entrada estándar', flush=True)
    credential = json.loads(sys.stdin.readline())
    remote, branch, token = credential['remote_url'], credential['branch'], credential['token']
    env = dict(os.environ, GIT_TERMINAL_PROMPT='0', GIT_ASKPASS=str(root/'tools/git-askpass.sh'),
               RPG_SITE_GIT_USER='x-access-token', RPG_SITE_GIT_TOKEN=token)
    def run(args):
        result = subprocess.run(args, cwd=root, env=env, capture_output=True, text=True)
        print((result.stdout+result.stderr).replace(token, '[redacted]'), end='', flush=True)
        if result.returncode:
            raise RuntimeError('Falló la operación Git: '+args[1])
        return result.stdout.strip()
    remotes = run(['git','remote']).splitlines()
    run(['git','remote','set-url' if 'sites' in remotes else 'add','sites',remote])
    run(['git','-c','credential.helper=','push','sites','HEAD:refs/heads/'+branch])
    head = run(['git','rev-parse','HEAD'])
    pushed = run(['git','-c','credential.helper=','ls-remote','sites','refs/heads/'+branch])
    if not pushed.startswith(head+'\t'):
        raise RuntimeError('El SHA remoto no coincide con la copia local')
    print('PUSH_VERIFIED '+head, flush=True)
finally:
    if old is not None:
        termios.tcsetattr(sys.stdin, termios.TCSANOW, old)
