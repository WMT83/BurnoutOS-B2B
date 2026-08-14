import base64, os

S = base64.b64encode(open("/home/claude/fonts/Syne.ttf", "rb").read()).decode()
D = base64.b64encode(open("/home/claude/fonts/DMSans.ttf", "rb").read()).decode()
HS = open("/tmp/headshot.txt").read()
QR = {c: open("/tmp/qr_%s.txt" % c).read() for c in ["whatsapp", "facebook", "linkedin"]}

CSS = """
@font-face{font-family:'Syne';src:url(data:font/ttf;base64,__SYNE__) format('truetype');font-weight:400 800;}
@font-face{font-family:'DMSansV';src:url(data:font/ttf;base64,__DM__) format('truetype');font-weight:100 1000;}
*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
body{background:#333;display:flex;flex-wrap:wrap;gap:40px;padding:40px;}
.p{position:relative;overflow:hidden;font-family:'DMSansV',sans-serif;display:flex;flex-direction:column;}
.sq{width:1080px;height:1080px;padding:64px 70px;}
.ld{width:1200px;height:627px;padding:50px 58px;}
.dark{background:radial-gradient(700px 540px at 95% -8%,rgba(232,75,42,.17),transparent 56%),linear-gradient(158deg,#161318 0%,#100e13 60%,#0d0c10 100%);--fg:#FAF7F4;--mut:rgba(250,247,244,.80);--dim:rgba(250,247,244,.58);--line:rgba(250,247,244,.14);--cardbg:rgba(255,255,255,.04);}
.light{background:radial-gradient(660px 520px at 95% -8%,rgba(232,75,42,.12),transparent 58%),linear-gradient(158deg,#F0ECE6 0%,#E9E4DC 60%,#E3DED5 100%);--fg:#141218;--mut:rgba(20,18,24,.76);--dim:rgba(20,18,24,.54);--line:rgba(20,18,24,.14);--cardbg:rgba(20,18,24,.035);}
.rule{position:absolute;inset:28px;border:1px solid var(--line);border-radius:3px;pointer-events:none;}
.arc{position:absolute;z-index:0;pointer-events:none;top:0;left:0;}
.top{display:flex;justify-content:space-between;align-items:flex-start;z-index:3;}
.wm{font-family:'Syne';font-variation-settings:'wght' 800;letter-spacing:-.02em;color:var(--fg);}
.sq .wm{font-size:40px;} .ld .wm{font-size:34px;}
.wm i{color:#E84B2A;font-style:normal;}
.loc{font-weight:700;letter-spacing:.2em;color:var(--dim);text-transform:uppercase;}
.sq .loc{font-size:19px;} .ld .loc{font-size:17px;}
.kick{font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:#E84B2A;}
.sq .kick{font-size:19px;} .ld .kick{font-size:16px;}
.kick span{color:var(--dim);letter-spacing:.02em;text-transform:none;font-weight:500;}
h1{font-family:'Syne';font-variation-settings:'wght' 800;letter-spacing:-.035em;line-height:.94;color:var(--fg);}
.sq h1{font-size:50px;} .ld h1{font-size:46px;}
h1 em{color:#E84B2A;font-style:normal;}
.lede{color:var(--mut);line-height:1.36;}
.sq .lede{font-size:25px;} .ld .lede{font-size:19px;}
.lede b{font-family:'Syne';font-variation-settings:'wght' 800;color:var(--fg);}
.dates{color:var(--fg);}
.sq .dates{font-size:21px;white-space:nowrap;}
.dates b{font-family:'Syne';font-variation-settings:'wght' 800;}
.dates i{color:var(--dim);font-style:normal;margin:0 9px;}
.scarce{color:#E84B2A;font-weight:700;letter-spacing:.01em;}
.sq .scarce{font-size:24px;} .ld .scarce{font-size:20px;}
.headwrap{display:flex;flex-direction:column;align-items:center;text-align:center;z-index:3;flex:0 0 auto;}
.sq .headwrap{width:230px;} .ld .headwrap{width:200px;}
.headwrap img{border-radius:50%;border:4px solid #E84B2A;object-fit:cover;}
.sq .headwrap img{width:128px;height:128px;} .ld .headwrap img{width:92px;height:92px;}
.hname{font-family:'Syne';font-variation-settings:'wght' 800;color:var(--fg);margin-top:13px;}
.sq .hname{font-size:24px;} .ld .hname{font-size:20px;}
.hcred{color:var(--dim);line-height:1.3;}
.sq .hcred{font-size:18px;} .ld .hcred{font-size:15px;}
.spacer{flex:1;}
.vs{display:flex;align-items:stretch;gap:10px;z-index:3;}
.vsi{flex:1 1 0;min-width:0;hyphens:none;overflow-wrap:normal;border:1px solid var(--line);border-radius:16px;background:var(--cardbg);display:flex;flex-direction:column;justify-content:center;text-align:center;}
.sq .vsi{padding:34px 12px;} .ld .vsi{padding:22px 10px;}
.vsi.sum{border-color:rgba(232,75,42,.55);background:linear-gradient(150deg,rgba(232,75,42,.20),rgba(232,75,42,.04));}
.vsm{font-family:'Syne';font-variation-settings:'wght' 800;letter-spacing:-.025em;line-height:1.03;color:var(--fg);}
.sq .vsm{font-size:30px;} .ld .vsm{font-size:26px;}
.vsi.sum .vsm{color:#E84B2A;}
.vss{color:var(--mut);line-height:1.28;font-weight:500;}
.sq .vss{font-size:21px;margin-top:12px;} .ld .vss{font-size:15px;margin-top:7px;}
.vso{display:flex;align-items:center;justify-content:center;flex:0 0 34px;font-family:'Syne';font-variation-settings:'wght' 800;color:#E84B2A;}
.sq .vso{font-size:46px;} .ld .vso{font-size:34px;}
.foot{z-index:3;border-top:1px solid var(--line);}

.sq .foot{padding-top:32px;} .ld .foot{padding-top:22px;}
.url{font-family:'Syne';font-variation-settings:'wght' 800;letter-spacing:-.03em;color:var(--fg);}
.sq .url{font-size:46px;} .ld .url{font-size:32px;}
.sub{color:var(--dim);margin-top:9px;}
.sq .sub{font-size:21px;} .ld .sub{font-size:17px;}
.qrw{text-align:center;}
.qrw img{border-radius:10px;background:#fff;display:block;}
.sq .qrw img{width:186px;height:186px;padding:6px;} .ld .qrw img{width:140px;height:140px;padding:5px;}
.qrl{font-weight:700;letter-spacing:.15em;text-transform:uppercase;color:var(--dim);margin-top:9px;}
.sq .qrl{font-size:15px;} .ld .qrl{font-size:12px;}
""".replace("__SYNE__", S).replace("__DM__", D)


def arc(w, h, path):
    return ('<svg class="arc" width="{w}" height="{h}" viewBox="0 0 {w} {h}" fill="none">'
            '<path d="{p}" stroke="rgba(232,75,42,.30)" stroke-width="2"/></svg>').format(w=w, h=h, p=path)


def stack():
    items = [("Two intensive days", "Joburg, Cape Town or online"),
             ("ACT for Burnout", "A full workshop, included"),
             ("Eight-week arc", "Three peer supervision sessions")]
    parts = []
    for n, s in items:
        parts.append('<div class="vsi"><div class="vsm">%s</div><div class="vss">%s</div></div>' % (n, s))
        parts.append('<div class="vso">+</div>')
    parts[-1] = '<div class="vso">=</div>'
    parts.append('<div class="vsi sum"><div class="vsm">32 CPD points</div>'
                 '<div class="vss">30 contact hours, with PsySSA</div></div>')
    return '<div class="vs">' + "".join(parts) + '</div>'


HEAD = ('<div class="headwrap"><img src="' + HS + '"><div class="hname">Werner Teichert</div>'
        '<div class="hcred">Clinical Psychologist (AHPRA), MBA</div></div>')


def square(pid, theme, qr):
    return """
<div class="p sq {th}" id="{pid}">
 {arc}
 <div class="top"><div class="wm">BurnoutOS<i>.</i></div></div>
 <div style="height:26px"></div>
 <div style="display:flex;gap:34px;align-items:flex-start;z-index:3">
   <div style="flex:1">
     <div class="kick">The Burnout Reset <span>&middot; a clinician's programme</span></div>
     <div style="height:18px"></div>
     <h1>Too busy not to<br><em>slow down.</em></h1>
     <div style="height:24px"></div>
     <div class="lede">Learn how to assess, formulate and treat the burnout cases that keep circling back.</div>
     <div style="height:22px"></div>
     <div class="dates"><b>Joburg</b> 10&ndash;11 Oct<i>&middot;</i><b>Cape Town</b> 16&ndash;17 Oct<i>&middot;</i><b>Online</b> live</div>
   </div>
   {head}
 </div>
 <div style="height:24px"></div>
 <div class="scarce">20 in-person places per city</div>
 <div class="spacer"></div>
 {vs}
 <div class="spacer"></div>
 <div class="foot">
   <div><div class="url">burnoutos.co.za/register</div><div class="sub">Early bird until 31 August &middot; In collaboration with PsySSA</div></div>
 </div>
</div>""".format(pid=pid, th=theme, qr=qr, head=HEAD, vs=stack(),
                 arc=arc(1080, 1080, "M 700 -120 C 1180 240, 1220 760, 760 1180"))


LD = """
<div class="p ld dark" id="p-linkedin">
 {arc}
 <div class="top"><div class="wm">BurnoutOS<i>.</i></div></div>
 <div style="height:18px"></div>
 <div style="display:flex;gap:32px;align-items:flex-start;z-index:3">
   <div style="flex:1">
     <div class="kick">The Burnout Reset <span>&middot; a clinician's programme</span></div>
     <div style="height:11px"></div>
     <h1>Too busy not to <em>slow down.</em></h1>
     <div style="height:14px"></div>
     <div class="lede">Assess, formulate and treat the burnout cases that keep circling back.<br>
       <b>Joburg</b> 10&ndash;11 Oct &middot; <b>Cape Town</b> 16&ndash;17 Oct &middot; <b>Online</b> live</div>
   </div>
   {head}
 </div>
 <div style="height:16px"></div>
 <div class="scarce">20 in-person places per city</div>
 <div class="spacer"></div>
 {vs}
 <div class="spacer"></div>
 <div class="foot">
   <div><div class="url">burnoutos.co.za/register</div><div class="sub">Early bird until 31 August &middot; In collaboration with PsySSA</div></div>
 </div>
</div>""".format(qr=QR["linkedin"], head=HEAD, vs=stack(),
                 arc=arc(1200, 627, "M 820 -120 C 1240 120, 1260 500, 880 700"))

html = "<!doctype html><html><head><meta charset='utf-8'><style>" + CSS + "</style></head><body>"
html += square("p-whatsapp", "dark", QR["whatsapp"])
html += square("p-facebook", "light", QR["facebook"])
html += LD
html += "</body></html>"

os.makedirs("/home/claude/posters", exist_ok=True)
open("/home/claude/posters/sa-tour-posters.html", "w").write(html)
print("built", len(html) // 1024, "KB")
