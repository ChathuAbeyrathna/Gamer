import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiPhone, FiCopy, FiExternalLink, FiChevronDown, FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import gamerLogo from "../images/logo.png";

export default function HelpSupport() {
    const [openFaq, setOpenFaq] = useState(null);
    const [copied, setCopied] = useState("");
    const navigate = useNavigate();

    const faqs = [
        { q: "How do I create an account?", a: "Click the Sign Up button in the top-right and fill the required details. You can use social sign-in if enabled." },
        { q: "I forgot my password — what now?", a: "On the login screen click 'Forgot Password' and follow the instructions to reset via your email." },
        { q: "How do I report abuse or a bug?", a: "Use our contact details or Google Form to contact our support." },
        { q: "Can I suggest new features?", a: "Yes! Feature suggestions are welcome — use the feedback option with a clear title and details so we can consider it in future updates." },
    ];

    const SUPPORT_EMAIL = "gamer@gmail.com";
    const SUPPORT_PHONE = "+94 71 660 4495";
    const GOOGLE_FORM = "https://forms.gle/mmfeyKvcQPtG8z5x6";

    function toggleFaq(i) {
        setOpenFaq(openFaq === i ? null : i);
    }

    function copyToClipboard(text, label) {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(label);
            setTimeout(() => setCopied(""), 1800);
        });
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 py-12">
            <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-[-1]"></div>

            <div className="container mx-auto px-6 lg:px-20">

                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-indigo-100 hover:text-indigo-200 transition-colors duration-200"
                    >
                        <FiArrowLeft className="text-3xl" />
                    </button>

                    <motion.img
                        src={gamerLogo}
                        alt="GAMER Logo"
                        className="h-20 cursor-pointer mx-auto"
                        onClick={() => navigate("/")}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    />

                    <div className="w-16"></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="rounded-2xl p-8 shadow-2xl"
                    style={{
                        background: `linear-gradient(to right, rgba(1, 152, 170, 0.85), rgba(27, 74, 140, 0.85))`
                    }}
                >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
                                GAMER Help & Support
                            </h1>
                            <p className="mt-2 text-indigo-100/90 max-w-2xl">
                                Need help or want to share feedback? We're listening. Use any of the contact methods below.
                            </p>
                        </div>

                        <div className="w-full lg:w-80">
                            <div className="rounded-xl bg-white/5 backdrop-blur-sm p-4 shadow-inner border border-white/5 hover:scale-[1.02] transition-transform duration-300">
                                <h4 className="text-sm font-semibold text-indigo-50/90">Quick Support</h4>
                                <p className="mt-2 text-sm text-indigo-100/80">
                                    Prefer direct contact? Use the options below or copy to clipboard.
                                </p>

                                <div className="mt-4 space-y-3">
                                    {/* Email */}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-md bg-white/6">
                                                <FiMail className="text-lg" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">Email</div>
                                                <div className="text-xs text-indigo-100/70">{SUPPORT_EMAIL}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(SUPPORT_EMAIL, "email")}
                                            className="px-3 py-1 rounded-md bg-white/6 text-sm hover:bg-white/10 transition-colors duration-200"
                                        >
                                            <FiCopy />
                                        </button>
                                    </div>

                                    {/* Phone */}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-md bg-white/6">
                                                <FiPhone className="text-lg" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">Phone / WhatsApp</div>
                                                <div className="text-xs text-indigo-100/70">{SUPPORT_PHONE}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(SUPPORT_PHONE, "phone")}
                                            className="px-3 py-1 rounded-md bg-white/6 text-sm hover:bg-white/10 transition-colors duration-200"
                                        >
                                            <FiCopy />
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {copied && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 6 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 6 }}
                                                className="mt-1 text-xs text-emerald-300"
                                            >
                                                {copied === "email" ? "Email copied to clipboard" : "Phone copied to clipboard"}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Content: FAQs + Contact */}
                <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="rounded-xl bg-white/5 p-6 shadow-lg border border-white/5">
                            <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>

                            <div className="space-y-3">
                                {faqs.map((f, i) => (
                                    <div key={i} className="bg-white/5 rounded-lg overflow-hidden hover:scale-[1.01] transition-transform duration-300">
                                        <button
                                            onClick={() => toggleFaq(i)}
                                            className="w-full flex items-center justify-between px-4 py-3 text-left"
                                        >
                                            <div>
                                                <div className="font-medium">{f.q}</div>
                                            </div>
                                            <motion.div
                                                animate={{ rotate: openFaq === i ? 180 : 0 }}
                                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            >
                                                <FiChevronDown />
                                            </motion.div>
                                        </button>

                                        <AnimatePresence>
                                            {openFaq === i && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="px-4 pb-4 pt-0 text-sm text-indigo-100/80"
                                                >
                                                    {f.a}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Side column: Contact + Links */}
                    <div>
                        <div className="rounded-xl bg-white/5 p-6 shadow-lg border border-white/5 sticky top-24 hover:scale-[1.02] transition-transform duration-300">
                            <h4 className="font-semibold">Contact & Links</h4>
                            <p className="text-sm mt-2 text-indigo-100/80">Pick your preferred channel. We reply to urgent issues faster.</p>

                            <div className="mt-4 space-y-3">
                                <motion.a whileHover={{ y: -2 }} href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-3 p-3 rounded-lg bg-white/6 hover:bg-white/5 transition-transform duration-200">
                                    <FiMail />
                                    <div>
                                        <div className="text-sm font-medium">Email</div>
                                        <div className="text-xs text-indigo-100/70">{SUPPORT_EMAIL}</div>
                                    </div>
                                </motion.a>

                                <motion.button whileHover={{ y: -2 }} onClick={() => copyToClipboard(SUPPORT_PHONE, "phone")} className="w-full text-left flex items-center gap-3 p-3 rounded-lg bg-white/6 hover:bg-white/5 transition-transform duration-200">
                                    <FiPhone />
                                    <div>
                                        <div className="text-sm font-medium">Phone / WhatsApp</div>
                                        <div className="text-xs text-indigo-100/70">{SUPPORT_PHONE}</div>
                                    </div>
                                </motion.button>

                                <motion.a whileHover={{ y: -2 }} href={GOOGLE_FORM} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-white/6 hover:bg-white/5 transition-transform duration-200">
                                    <FiExternalLink />
                                    <div>
                                        <div className="text-sm font-medium">Google Form</div>
                                        <div className="text-xs text-indigo-100/70">Structured feedback & reports</div>
                                    </div>
                                </motion.a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-center text-sm text-indigo-100/60">© {new Date().getFullYear()} GAMER. Help & Support ❤️ </div>
            </div>
        </div>
    );
}
