import base64, os

S = base64.b64encode(open("/home/claude/fonts/Syne.ttf", "rb").read()).decode()
D = base64.b64encode(open("/home/claude/fonts/DMSans.ttf", "rb").read()).decode()

CSS = """
@font-face{font-family:'Syne';src:url(data:font/ttf;base64,__S__) format('truetype');font-weight:400 800;}
@font-face{font-family:'DMSansV';src:url(data:font/ttf;base64,__D__) format('truetype');font-weight:100 1000;}
*{margin:0;padding:0;box-sizing:border-box;-webkit-font-smoothing:antialiased;}
body{background:#333;padding:40px;}
#c{width:1080px;height:1350px;padding:74px 76px;position:relative;overflow:hidden;
   display:flex;flex-direction:column;font-family:'DMSansV',sans-serif;
   background:radial-gradient(720px 560px at 96% -8%,rgba(232,75,42,.16),transparent 56%),
              linear-gradient(158deg,#161318 0%,#100e13 60%,#0d0c10 100%);
   --fg:#FAF7F4;--mut:rgba(250,247,244,.80);--dim:rgba(250,247,244,.56);--line:rgba(250,247,244,.14);}
.arc{position:absolute;top:0;left:0;z-index:0;pointer-events:none;}
.wm{font-family:'Syne';font-variation-settings:'wght' 800;font-size:40px;letter-spacing:-.02em;color:var(--fg);z-index:2;}
.wm i{color:#E84B2A;font-style:normal;}
.eyebrow{font-weight:700;font-size:19px;letter-spacing:.2em;text-transform:uppercase;color:#E84B2A;z-index:2;}
h1{font-family:'Syne';font-variation-settings:'wght' 800;font-size:76px;line-height:.96;
   letter-spacing:-.035em;color:var(--fg);z-index:2;}
h1 em{color:#E84B2A;font-style:normal;}
.rows{z-index:2;}
.r{display:flex;align-items:baseline;justify-content:space-between;gap:24px;
   padding:22px 0;border-bottom:1px solid var(--line);}
.r .k{font-size:31px;font-weight:700;color:var(--fg);}
.r .v{font-family:'Syne';font-variation-settings:'wght' 800;font-size:46px;color:var(--fg);
      letter-spacing:-.02em;white-space:nowrap;}
.r.total{border-bottom:none;border-top:2px solid rgba(232,75,42,.5);margin-top:6px;padding-top:26px;}
.r.total .k{font-family:'Syne';font-variation-settings:'wght' 800;font-size:40px;color:var(--fg);}
.r.total .v{font-size:64px;color:#E84B2A;}
.prices{z-index:2;display:flex;gap:16px;}
.pc{flex:1 1 0;min-width:0;border:1px solid var(--line);border-radius:16px;padding:28px 24px;
    background:rgba(255,255,255,.035);}
.pc.online{border-color:rgba(232,75,42,.5);background:linear-gradient(150deg,rgba(232,75,42,.16),rgba(232,75,42,.03));}
.pl{font-size:23px;color:var(--dim);}
.pv{font-family:'Syne';font-variation-settings:'wght' 800;font-size:52px;color:var(--fg);
    letter-spacing:-.03em;margin-top:6px;}
.pc.online .pv{color:#E84B2A;}
.spacer{flex:1;}
.foot{z-index:2;border-top:1px solid var(--line);padding-top:30px;}
.url{font-family:'Syne';font-variation-settings:'wght' 800;font-size:44px;letter-spacing:-.03em;color:var(--fg);}
.sub{font-size:21px;color:var(--dim);margin-top:6px;}
""".replace("__S__", S).replace("__D__", D)

ROWS = [("Two intensive days", "16"),
        ("ACT for Burnout", "8"),
        ("Three peer supervision sessions", "8")]

rows = "".join('<div class="r"><div class="k">%s</div><div class="v">%s</div></div>' % (k, v) for k, v in ROWS)
rows += '<div class="r total"><div class="k">Total</div><div class="v">32</div></div>'

HTML = """<!doctype html><html><head><meta charset="utf-8"><style>""" + CSS + """</style></head><body>
<div id="c">
  <svg class="arc" width="1080" height="1350" viewBox="0 0 1080 1350" fill="none">
    <path d="M 720 -140 C 1200 300, 1240 950, 760 1420" stroke="rgba(232,75,42,.28)" stroke-width="2"/>
  </svg>
  <div class="wm">BurnoutOS<i>.</i></div>
  <div style="height:34px"></div>
  <div class="eyebrow">The Burnout Reset &middot; What is included</div>
  <div style="height:20px"></div>
  <h1>Three parts.<br><em>32 CPD points.</em></h1>
  <div style="height:40px"></div>
  <div class="rows">""" + rows + """</div>
  <div class="spacer"></div>
  <div class="prices">
    <div class="pc">
      <div class="pl">In person, Joburg or Cape Town</div>
      <div class="pv">R8,950</div>
    </div>
    <div class="pc online">
      <div class="pl">Live online</div>
      <div class="pv">R5,950</div>
    </div>
  </div>
  <div class="spacer"></div>
  <div class="foot">
    <div class="url">burnoutos.co.za/register</div>
    <div class="sub">Early bird until 31 August &middot; In collaboration with PsySSA</div>
  </div>
</div></body></html>"""

os.makedirs("/home/claude/retarget", exist_ok=True)
open("/home/claude/retarget/value-stack-4x5.html", "w").write(HTML)
print("built")
