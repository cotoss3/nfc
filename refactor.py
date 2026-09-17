# -*- coding: utf-8 -*-
import re

with open('src/components/landings/ProductLanding.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add X import
if 'X,' not in content:
    content = content.replace('MapPin,', 'MapPin,\n  X,')

# 2. Add state
state_str = 'const [hasCustomLogo, setHasCustomLogo] = useState(false);'
if 'isMobileCheckoutOpen' not in content:
    content = content.replace(state_str, state_str + '\n  const [isMobileCheckoutOpen, setIsMobileCheckoutOpen] = useState(false);')

# 3. Extract the form
form_start_marker = '<div className="lg:col-span-7 p-5 sm:p-8 md:p-10 space-y-6 sm:space-y-8 flex flex-col justify-between">'
form_end_marker = '              </form>\n            </div>'

if 'const renderCheckoutForm' not in content:
    start_idx = content.find(form_start_marker)
    end_idx = content.find(form_end_marker, start_idx) + len(form_end_marker)

    inner_start = content.find('<div className="space-y-2">', start_idx)
    inner_form_jsx = content[inner_start : content.find('</form>', inner_start) + len('</form>')]

    render_form_fn = f'''
  const renderCheckoutForm = () => (
    <div className="space-y-6 sm:space-y-8 flex flex-col justify-between">
      {{inner_form_jsx}}
    </div>
  );
'''.replace('{{inner_form_jsx}}', inner_form_jsx)

    return_idx = content.find('  return (\n')
    content = content[:return_idx] + render_form_fn + '\n' + content[return_idx:]

    orig_start_idx = content.find(form_start_marker)
    orig_end_idx = content.find(form_end_marker, orig_start_idx) + len(form_end_marker)

    replacement = '<div className="lg:col-span-7 p-5 sm:p-8 md:p-10">\n              {renderCheckoutForm()}\n            </div>'

    content = content[:orig_start_idx] + replacement + content[orig_end_idx:]

# 4. Hide checkout section on mobile
content = content.replace(
    '<section id="checkout-section" className="py-12 sm:py-20 px-4 sm:px-6 bg-brand-50">',
    '<section id="checkout-section" className="hidden md:block py-12 sm:py-20 px-4 sm:px-6 bg-brand-50">'
)

# 5. Modify Mobile Buy Bar
mobile_bar_start = content.find('{/* Sticky Mobile Buy Bar */}')
mobile_bar_str = '''      {/* Sticky Mobile Buy Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-brand-200 p-3.5 shadow-[0_-8px_20px_rgba(0,0,0,0.12)] flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-brand-500 block uppercase font-extrabold tracking-wider">Total con envío</span>
          <span className="text-xl font-black text-brand-950"></span>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileCheckoutOpen(true)}
          className="shopify-btn-primary flex-1 py-3.5 rounded-xl shadow-lg font-bold flex items-center justify-center gap-2"
        >
          Comprar <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile Checkout Modal */}
      {isMobileCheckoutOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end justify-center bg-brand-950/60 backdrop-blur-sm" onClick={() => setIsMobileCheckoutOpen(false)}>
          <div 
            className="w-full bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto shadow-2xl relative" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/95 backdrop-blur-md z-10 px-5 py-4 border-b border-brand-100 flex justify-between items-center">
              <span className="font-black text-brand-950 text-lg">Personaliza tu pedido</span>
              <button 
                type="button" 
                onClick={() => setIsMobileCheckoutOpen(false)}
                className="w-8 h-8 flex items-center justify-center bg-brand-100 text-brand-700 hover:bg-brand-200 rounded-full font-bold transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
            <div className="p-5 pb-24">
              {renderCheckoutForm()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'''

if '{isMobileCheckoutOpen &&' not in content:
    # Just replace from Sticky Mobile Buy Bar to the end of the file
    content = content[:mobile_bar_start] + mobile_bar_str

with open('src/components/landings/ProductLanding.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
