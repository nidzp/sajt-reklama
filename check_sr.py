import pathlib, re
text = pathlib.Path(''index.html'').read_text(encoding='utf-8')
for match in re.finditer(r'data-i18n-[^=]+-sr="([^"]+)"', text):
    print(match.group(1))
