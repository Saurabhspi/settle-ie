import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const features = [
  {
    icon: '🗺️',
    title: 'Personalised roadmap',
    description: 'Tell us your nationality and visa type. We generate a step-by-step checklist tailored exactly to your situation — in the right order.',
    tag: 'Roadmap',
  },
  {
    icon: '🤖',
    title: 'Ask Fáilte anything',
    description: 'Our AI assistant answers questions about PPS numbers, IRP cards, tax, health cards and more — sourced directly from official Irish government websites.',
    tag: 'AI assistant',
  },
  {
    icon: '📄',
    title: 'Document vault',
    description: 'Upload your passport, employment letter, proof of address and other documents. Store them securely in the cloud, access them anytime.',
    tag: 'Documents',
  },
  {
    icon: '🔔',
    title: 'Deadline reminders',
    description: 'Never miss an important deadline. We track key dates like your IRP card 90-day registration window and send email reminders automatically.',
    tag: 'Reminders',
  },
];

const steps = [
  {
    number: '01',
    title: 'Tell us about yourself',
    description: 'Answer a short quiz — your nationality, visa type, arrival date, and situation. Takes under 2 minutes.',
  },
  {
    number: '02',
    title: 'Get your roadmap',
    description: 'We generate a personalised checklist of everything you need to do in Ireland, in the right order, with deadlines.',
  },
  {
    number: '03',
    title: 'Ask Fáilte questions',
    description: 'Got questions? Ask our AI assistant anything. It answers using official Irish government sources — accurate and up to date.',
  },
];

const faqs = [
  {
    q: 'Is Settle.ie free?',
    a: 'Yes, completely free. No credit card, no subscription.',
  },
  {
    q: 'What countries is this for?',
    a: 'Anyone moving to Ireland — whether from India, Brazil, Nigeria, EU countries, or anywhere else. The roadmap adapts to your specific visa and nationality.',
  },
  {
    q: 'How accurate is the AI assistant?',
    a: 'Fáilte answers only from official Irish government websites like citizensinformation.ie and irishimmigration.ie. Every answer includes the source URL so you can verify.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. All documents are stored encrypted on Cloudinary. Passwords are hashed with bcrypt and never stored in plain text.',
  },
];

// Reusable animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: '#F7F3EB' }}>

      {/* Navbar — slides down on load */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ background: '#F7F3EB', borderBottom: '0.5px solid #DDD8CC' }}
        className="px-6 py-4 flex justify-between items-center sticky top-0 z-50"
      >
        <div className="flex items-center gap-2">
          <span style={{ color: '#1A3D2B', fontSize: '18px', fontWeight: 500 }}>
            Settle.ie
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" style={{ color: '#5A6B5E', fontSize: '13px' }}
            className="hover:text-forest-700 transition-colors">
            Features
          </a>
          <a href="#how-it-works" style={{ color: '#5A6B5E', fontSize: '13px' }}
            className="hover:text-forest-700 transition-colors">
            How it works
          </a>
          <a href="#faq" style={{ color: '#5A6B5E', fontSize: '13px' }}
            className="hover:text-forest-700 transition-colors">
            FAQ
          </a>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              color: '#1A3D2B', fontSize: '13px', border: '0.5px solid #B8C4BC',
              padding: '7px 16px', borderRadius: '8px', background: 'transparent',
              cursor: 'pointer',
            }}
          >
            Sign in
          </motion.button>
          <motion.button
            onClick={() => navigate('/register')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: '#1A3D2B', color: '#F7F3EB', fontSize: '13px',
              padding: '7px 16px', borderRadius: '8px', border: 'none',
              cursor: 'pointer',
            }}
          >
            Get started free
          </motion.button>
        </div>
      </motion.nav>

      {/* Hero — fades in on load */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div style={{
            background: '#1A3D2B', color: '#F7F3EB', fontSize: '11px',
            padding: '5px 14px', borderRadius: '20px', display: 'inline-block',
            marginBottom: '20px', fontWeight: 500, letterSpacing: '0.05em',
          }}>
            FREE · AI-POWERED · MADE FOR IRELAND
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            color: '#1A3D2B', fontSize: '48px', fontWeight: 500,
            lineHeight: 1.15, margin: '0 0 20px',
          }}
        >
          Moving to Ireland?<br />
          <span style={{ color: '#0F6E56' }}>We'll guide every step.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            color: '#5A6B5E', fontSize: '16px', lineHeight: 1.7,
            margin: '0 auto 32px', maxWidth: '520px',
          }}
        >
          Settle.ie gives you a personalised relocation roadmap, an AI assistant
          that answers questions about Irish bureaucracy, and a secure document
          vault — all completely free.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex gap-3 justify-center flex-wrap"
        >
          <motion.button
            onClick={() => navigate('/register')}
            whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(26,61,43,0.2)' }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: '#1A3D2B', color: '#F7F3EB', fontSize: '14px',
              padding: '12px 28px', borderRadius: '10px', border: 'none',
              fontWeight: 500, cursor: 'pointer',
            }}
          >
            Build my roadmap — it's free
          </motion.button>
          <motion.button
            onClick={() => navigate('/login')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: 'transparent', color: '#1A3D2B', fontSize: '14px',
              padding: '12px 28px', borderRadius: '10px',
              border: '0.5px solid #B8C4BC', cursor: 'pointer',
            }}
          >
            Sign in
          </motion.button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{ color: '#B8C4BC', fontSize: '12px', marginTop: '14px' }}
        >
          No credit card required. Takes 2 minutes to set up.
        </motion.p>
      </section>

      {/* Stats bar — animates in when scrolled into view */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        transition={{ duration: 0.5 }}
        style={{ background: '#1A3D2B', padding: '24px' }}
      >
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-3xl mx-auto grid grid-cols-3 gap-4 text-center"
        >
          {[
            { number: '10+', label: 'Relocation steps' },
            { number: '6', label: 'Gov sources scraped' },
            { number: '100%', label: 'Free forever' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              style={{
                borderRight: i < 2 ? '0.5px solid #2A5C3E' : 'none',
              }}
            >
              <p style={{ color: '#5DCAA5', fontSize: '24px', fontWeight: 500, margin: 0 }}>
                {stat.number}
              </p>
              <p style={{ color: '#8FB89E', fontSize: '12px', margin: 0 }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>

      {/* Features — each card animates in with stagger */}
      <section id="features" className="px-6 py-20 max-w-5xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p style={{
            color: '#0F6E56', fontSize: '11px', fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px',
          }}>
            Features
          </p>
          <h2 style={{ color: '#1A3D2B', fontSize: '28px', fontWeight: 500, margin: 0 }}>
            Everything you need to settle in Ireland
          </h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{
                y: -6,
                boxShadow: '0 12px 32px rgba(26,61,43,0.10)',
                borderColor: '#B8C4BC',
              }}
              transition={{ duration: 0.2 }}
              style={{
                background: '#fff', border: '0.5px solid #DDD8CC',
                borderRadius: '16px', padding: '24px', cursor: 'default',
              }}
            >
              <div style={{
                background: '#F7F3EB', width: '44px', height: '44px',
                borderRadius: '12px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: '14px', fontSize: '20px',
              }}>
                {f.icon}
              </div>
              <p style={{
                color: '#0F6E56', fontSize: '11px', fontWeight: 500,
                textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px',
              }}>
                {f.tag}
              </p>
              <h3 style={{ color: '#1A3D2B', fontSize: '15px', fontWeight: 500, margin: '0 0 8px' }}>
                {f.title}
              </h3>
              <p style={{ color: '#5A6B5E', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                {f.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* How it works */}
      <section id="how-it-works" style={{ background: '#1A3D2B' }} className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <p style={{
              color: '#5DCAA5', fontSize: '11px', fontWeight: 500,
              textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px',
            }}>
              How it works
            </p>
            <h2 style={{ color: '#F7F3EB', fontSize: '28px', fontWeight: 500, margin: 0 }}>
              Set up in minutes
            </h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {steps.map((step, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                style={{ borderTop: '2px solid #2A5C3E', paddingTop: '20px' }}
              >
                <p style={{
                  color: '#5DCAA5', fontSize: '24px', fontWeight: 500,
                  margin: '0 0 12px', fontFamily: 'monospace',
                }}>
                  {step.number}
                </p>
                <h3 style={{ color: '#F7F3EB', fontSize: '15px', fontWeight: 500, margin: '0 0 8px' }}>
                  {step.title}
                </h3>
                <p style={{ color: '#8FB89E', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-12"
          >
            <motion.button
              onClick={() => navigate('/register')}
              whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(93,202,165,0.3)' }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: '#5DCAA5', color: '#0F2A1E', fontSize: '14px',
                padding: '12px 28px', borderRadius: '10px', border: 'none',
                fontWeight: 500, cursor: 'pointer',
              }}
            >
              Get started free
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Powered by */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        transition={{ duration: 0.5 }}
        className="px-6 py-12"
        style={{ borderBottom: '0.5px solid #DDD8CC' }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <p style={{
            color: '#B8C4BC', fontSize: '11px', marginBottom: '14px',
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            Powered by
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {['Groq Llama 3.1', 'Pinecone', 'citizensinformation.ie',
              'irishimmigration.ie', 'revenue.ie'].map((tech, i) => (
                <motion.span
                  key={i}
                  whileHover={{ color: '#1A3D2B' }}
                  style={{ color: '#7A8C7E', fontSize: '12px', fontWeight: 500 }}
                >
                  {tech}
                </motion.span>
              ))}
          </div>
        </div>
      </motion.section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-20 max-w-3xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <p style={{
            color: '#0F6E56', fontSize: '11px', fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px',
          }}>
            FAQ
          </p>
          <h2 style={{ color: '#1A3D2B', fontSize: '28px', fontWeight: 500, margin: 0 }}>
            Common questions
          </h2>
        </motion.div>

        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="space-y-3"
        >
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ borderColor: '#B8C4BC', y: -2 }}
              transition={{ duration: 0.15 }}
              style={{
                background: '#fff', border: '0.5px solid #DDD8CC',
                borderRadius: '12px', padding: '20px',
              }}
            >
              <p style={{
                color: '#1A3D2B', fontSize: '14px', fontWeight: 500,
                margin: '0 0 8px',
              }}>
                {faq.q}
              </p>
              <p style={{ color: '#5A6B5E', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                {faq.a}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
        transition={{ duration: 0.5 }}
        style={{ background: '#1A3D2B' }}
        className="px-6 py-20 text-center"
      >
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, type: 'spring' }}
            style={{ fontSize: '40px', marginBottom: '16px' }}
          >
            🇮🇪
          </motion.div>
          <h2 style={{
            color: '#F7F3EB', fontSize: '28px', fontWeight: 500,
            margin: '0 0 12px', lineHeight: 1.3,
          }}>
            Céad Míle Fáilte
          </h2>
          <p style={{
            color: '#8FB89E', fontSize: '14px', lineHeight: 1.7,
            margin: '0 0 28px',
          }}>
            A hundred thousand welcomes. Start your Irish journey today —
            your personalised roadmap is waiting.
          </p>
          <motion.button
            onClick={() => navigate('/register')}
            whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(93,202,165,0.3)' }}
            whileTap={{ scale: 0.97 }}
            style={{
              background: '#5DCAA5', color: '#0F2A1E', fontSize: '14px',
              padding: '12px 32px', borderRadius: '10px', border: 'none',
              fontWeight: 500, cursor: 'pointer',
            }}
          >
            Build my roadmap — it's free
          </motion.button>
        </div>
      </motion.section>

      {/* Footer */}
      <footer style={{ background: '#0F2A1E', padding: '24px' }}>
        <div className="max-w-5xl mx-auto flex justify-between items-center flex-wrap gap-4">
          <span style={{ color: '#2A5C3E', fontSize: '13px', fontWeight: 500 }}>
            Settle.ie
          </span>
          <p style={{ color: '#2A5C3E', fontSize: '12px', margin: 0 }}>
            Built with care for everyone moving to Ireland 🇮🇪
          </p>
          <div className="flex gap-4">
            <span style={{ color: '#2A5C3E', fontSize: '12px' }}>
              Built by Saurabh Anand
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}