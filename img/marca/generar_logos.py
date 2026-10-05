import sys, os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
# Requiere fontTools y la fuente Jost (paquete npm @fontsource/jost)
F="fonts/jost-latin-%s-normal.woff"
fonts={w:TTFont(F%w) for w in (500,600,700)}

def text(weight, s, x, baseline, cap, tracking=0.0, width=None):
    """Return (path_d, x_end). cap = cap height in px. tracking in em; or width = exact span (ink)."""
    f=fonts[weight]; gs=f.getGlyphSet(); cmap=f.getBestCmap()
    k=cap/f['OS/2'].sCapHeight
    names=[cmap[ord(c)] for c in s]
    adv=[gs[n].width*k for n in names]
    def ink(n):
        bp=BoundsPen(gs); gs[n].draw(bp); return bp.bounds
    lsb=ink(names[0])[0]*k; last=ink(names[-1]); rsb=adv[-1]-last[2]*k
    natural=sum(adv)-lsb-rsb
    em=f['head'].unitsPerEm*k
    tr = (width-natural)/(len(s)-1) if width else tracking*em
    pen=SVGPathPen(gs); cx=x-lsb
    for n,a in zip(names,adv):
        gs[n].draw(TransformPen(pen,(k,0,0,-k,cx,baseline))); cx+=a+tr
    return pen.getCommands(), x+natural+tr*(len(s)-1)

RED="#950606"; RED_D="#6e0404"; INK="#2b2b2b"; GRAY="#6e6e6c"; LGRAY="#d9d9d6"; WHITE="#ffffff"

def icon(line=GRAY, block=LGRAY, sw=15, dx=0, dy=0):
    # Trazo tomado del logo 1 (coordenadas originales), con línea más gruesa y bloque en color de marca
    return f'''<g transform="translate({dx} {dy})">
    <rect x="250" y="428" width="152" height="212" rx="5" fill="{block}"/>
    <path d="M150 636 H222 V543 L440 440 V341 H343 V607 H548 V522 L443 463 V637 H654" fill="none" stroke="{line}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>
  </g>'''
ICON_BOX=(150-6,341-6,654+6,640+6)

def svg(vb, body, title="Amara Home"):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="{title}"><title>{title}</title>\n  {body}\n</svg>\n'

# ----- Horizontal -----
HOME_X=700; HOME_BASE=640; HOME_CAP=250
AM_CAP=70; AM_GAP=32; AM_TR=0.28
home_d, home_end = text(700,"Home",HOME_X,HOME_BASE,HOME_CAP,tracking=-0.01)
def amara_right(x_end, baseline):
    d,e=text(500,"AMARA",0,baseline,AM_CAP,tracking=AM_TR)
    return text(500,"AMARA",x_end-e-4,baseline,AM_CAP,tracking=AM_TR)[0]
def horizontal(c_home, c_amara, c_line, c_block):
    ab=HOME_BASE-HOME_CAP-AM_GAP
    body=f"""{icon(c_line,c_block)}
  <path d="{amara_right(home_end, ab)}" fill="{c_amara}"/>
  <path d="{home_d}" fill="{c_home}"/>"""
    x0=ICON_BOX[0]; y0=min(ab-AM_CAP, ICON_BOX[1])-8; x1=home_end+10; y1=ICON_BOX[3]+2
    return svg(f"{x0} {y0} {x1-x0} {y1-y0}", body)

# ----- Vertical (ícono arriba, texto centrado) -----
def vertical(c_home, c_amara, c_line, c_block):
    w=home_end-HOME_X; cx=(150+654)/2; hx=cx-w/2
    ab=640+70+AM_CAP; hb=ab+AM_GAP+HOME_CAP
    hd,he=text(700,"Home",hx,hb,HOME_CAP,tracking=-0.01)
    d,e=text(500,"AMARA",0,ab,AM_CAP,tracking=AM_TR)
    ad,_=text(500,"AMARA",cx-e/2,ab,AM_CAP,tracking=AM_TR)
    body=f"""{icon(c_line,c_block)}
  <path d="{ad}" fill="{c_amara}"/>
  <path d="{hd}" fill="{c_home}"/>"""
    x0=min(hx,150)-12; x1=max(he,654)+12; y0=341-14; y1=hb+14
    return svg(f"{x0} {y0} {x1-x0} {y1-y0}", body)

# ----- Ícono (para redes y favicon): fondo rojo, trazo blanco -----
def icono(bg=RED, line=WHITE, block="#b83a3a", sw=30):
    cx=(150+654)/2; cy=(341+640)/2+4; side=640
    body=f"""<rect x="{cx-side/2}" y="{cy-side/2}" width="{side}" height="{side}" rx="{side*0.2}" fill="{bg}"/>
  {icon(line,block,sw)}"""
    return svg(f"{cx-side/2} {cy-side/2} {side} {side}", body)
def icono_simple(line=GRAY, block=LGRAY, sw=18):
    x0,y0,x1,y1=ICON_BOX
    return svg(f"{x0-4} {y0-4} {x1-x0+8} {y1-y0+8}", icon(line,block,sw))

out=sys.argv[1]; os.makedirs(out,exist_ok=True)
files={
 "amara-home-horizontal.svg": horizontal(RED, INK, GRAY, LGRAY),
 "amara-home-horizontal-blanco.svg": horizontal(WHITE, WHITE, "#bdbdbb", "#5a5a58"),
 "amara-home-horizontal-negro.svg": horizontal(INK, INK, INK, LGRAY),
 "amara-home-vertical.svg": vertical(RED, INK, GRAY, LGRAY),
 "amara-home-vertical-blanco.svg": vertical(WHITE, WHITE, "#bdbdbb", "#5a5a58"),
 "amara-home-icono.svg": icono_simple(),
 "amara-home-icono-rojo.svg": icono(),
}
for n,c in files.items(): open(os.path.join(out,n),"w").write(c)
print("ok", home_end)
