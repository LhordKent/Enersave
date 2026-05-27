from docx import Document
p=r"C:\Users\Admin\Downloads\FR1-Template-Enersave.docx"
d=Document(p)
for i,para in enumerate(d.paragraphs,1):
    t=para.text.strip()
    if t and ("Enersave" in t or "ENERGY OPERATIONS" in t or "Software Specification" in t or "Figure 1 shows" in t):
        print(f"P{i}: {t}")
