"""Remove only unreferenced generated MP3s; preview unless --apply is given."""
import argparse
import re
from build import ROOT, read_json, write_json


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    directory = (ROOT / 'audio/generated').resolve()
    if not directory.is_relative_to(ROOT.resolve()):
        raise SystemExit('Generated directory is outside the project')
    referenced = {a['file'] for a in read_json(ROOT / 'content/audio-manifest.json')['assets']}
    unused = []
    for path in directory.rglob('*.mp3'):
        if not path.resolve().is_relative_to(directory):
            raise SystemExit('Audio path escapes generated directory')
        relative = path.relative_to(ROOT).as_posix()
        if relative not in referenced and re.fullmatch(r'audio/generated/(gb|us)/[0-9a-f]{24}\.mp3', relative):
            unused.append({'file': relative, 'bytes': path.stat().st_size})
    if args.apply:
        for row in unused:
            (ROOT / row['file']).unlink()
        audit = ROOT / 'docs/audits/audio-orphans-removed.json'
        previous = read_json(audit) if audit.exists() else []
        write_json(audit, previous + unused)
    print({'files': len(unused), 'bytes': sum(r['bytes'] for r in unused), 'removed': args.apply})


if __name__ == '__main__':
    main()
