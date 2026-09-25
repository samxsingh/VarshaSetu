"""
VarshaSetu - Deterministic Advisory Bilingual Templates (Phase 5C)
Provides strictly controlled, non-hallucinatory templates for all agronomic
rules in English and Hindi. Ensures zero imperative directives and exact numeric preservation.
"""

from typing import Dict, Any
from app.localization.schemas import LanguageCode

TEMPLATE_VERSION = "1.0.0"

STANDARD_DISCLOSURE_EN = (
    "Notice: This advisory is an informational agro-climatic risk indicator derived from "
    "calibrated meteorological forecasts. It does not provide certified crop management, "
    "chemical application, or planting directives."
)

STANDARD_DISCLOSURE_HI = (
    "सूचना: यह सलाह अंशांकित मौसम पूर्वानुमानों से प्राप्त एक सूचनात्मक कृषि-जलवायु जोखिम सूचक है। "
    "यह प्रमाणित फसल प्रबंधन, रासायनिक छिड़काव अथवा बोआई निर्देश प्रदान नहीं करती है।"
)

HISTORICAL_LIMITATION_EN = (
    "Historical Ground Anchor Limitation: Evaluated against observational ground records from "
    "Bakshi Ka Talab (UP_LKO_BKT, Kharif 2024 season, 122 daily records). Multi-year operational "
    "verification remains pending."
)

HISTORICAL_LIMITATION_HI = (
    "ऐतिहासिक धरातलीय सीमा: बख्शी का तालाब (UP_LKO_BKT, खरीफ 2024 सत्र, 122 दैनिक रिकॉर्ड) के "
    "अवलोकनों के आधार पर मूल्यांकित। बहु-वर्षीय परिचालन सत्यापन अभी लंबित है।"
)

# Rule-specific templates
ADVISORY_TEMPLATES: Dict[str, Dict[LanguageCode, Dict[str, str]]] = {
    "AGRO_HEAVY_RAIN_INFO_001": {
        LanguageCode.EN: {
            "title": "Heavy Rainfall Risk Indicator",
            "summary": (
                "Heavy rainfall risk indicator detected for the {horizon_days}-day forecast window. "
                "Model forecasts indicate a {probability_pct}% calibrated probability of 24h rainfall exceeding 64.5 mm."
            ),
            "risk_indicator": "Watch: Potential 24-hour rainfall exceeding 64.5 mm.",
            "what_it_means": (
                "Atmospheric indicators show heightened probability of significant rainfall within the next {horizon_days} days. "
                "Ground fields may experience localized surface saturation."
            ),
            "confidence_statement": "Model confidence is calibrated against historical meteorological observations ({confidence_status}).",
        },
        LanguageCode.HI: {
            "title": "भारी वर्षा जोखिम सूचक",
            "summary": (
                "आगामी {horizon_days} दिनों की पूर्वानुमान अवधि के लिए भारी वर्षा जोखिम सूचक सक्रिय है। "
                "मॉडल पूर्वानुमान 24 घंटे में 64.5 मिमी से अधिक वर्षा की {probability_pct}% अंशांकित संभावना दर्शाते हैं।"
            ),
            "risk_indicator": "निगरानी: 24 घंटे में 64.5 मिमी से अधिक वर्षा की संभावना।",
            "what_it_means": (
                "मौसम के संकेतक आगामी {horizon_days} दिनों के भीतर महत्वपूर्ण वर्षा की बढ़ी हुई संभावना दर्शाते हैं। "
                "खेतों में स्थानीय जलभराव की स्थिति बन सकती है।"
            ),
            "confidence_statement": "मॉडल की विश्वसनीयता ऐतिहासिक मौसम अवलोकनों के आधार पर अंशांकित है ({confidence_status})।",
        },
    },
    "AGRO_PADDY_HEAVY_RAIN_HARVEST_001": {
        LanguageCode.EN: {
            "title": "Paddy Harvest Stage Heavy Rain Watch",
            "summary": (
                "Paddy maturity/harvest window heavy precipitation indicator. "
                "Forecast models project a {probability_pct}% chance of significant rainfall during the {horizon_days}-day window."
            ),
            "risk_indicator": "Elevated Watch: Heavy rain exposure during paddy maturity/harvest stage.",
            "what_it_means": (
                "Paddy fields currently in maturity or harvest stage face an elevated chance of rainfall ({probability_pct}%). "
                "Heavy precipitation at this stage can lead to grain wetting or lodging."
            ),
            "confidence_statement": "Forecast signal evaluated with calibrated meteorological probability models ({confidence_status}).",
        },
        LanguageCode.HI: {
            "title": "धान कटाई अवस्था भारी वर्षा निगरानी",
            "summary": (
                "धान की परिपक्वता/कटाई अवधि के लिए भारी वर्षा सूचक। "
                "पूर्वानुमान मॉडल {horizon_days} दिनों की अवधि में महत्वपूर्ण वर्षा की {probability_pct}% संभावना दर्शाते हैं।"
            ),
            "risk_indicator": "सतर्कता निगरानी: धान की परिपक्वता/कटाई के दौरान भारी वर्षा का जोखिम।",
            "what_it_means": (
                "परिपक्वता या कटाई अवस्था में धान की फसलों के लिए वर्षा की {probability_pct}% संभावना है। "
                "इस अवस्था में भारी वर्षा से फसल गिरने या दानों में नमी का जोखिम हो सकता है।"
            ),
            "confidence_statement": "पूर्वानुमान संकेत अंशांकित मौसम संभावना मॉडल पर आधारित है ({confidence_status})।",
        },
    },
    "AGRO_DRY_SPELL_INFO_001": {
        LanguageCode.EN: {
            "title": "Dry Spell Risk Indicator",
            "summary": (
                "Dry-spell risk indicator detected for the {horizon_days}-day forecast window. "
                "Forecast models project a {probability_pct}% calibrated probability of >=5 consecutive dry days."
            ),
            "risk_indicator": "Watch: Sustained dry interval of 5 or more consecutive days (<1.0 mm/day).",
            "what_it_means": (
                "Atmospheric models indicate extended dry conditions over the next {horizon_days} days. "
                "Soil moisture depletion may accelerate in topsoil layers."
            ),
            "confidence_statement": "Evaluated using calibrated dry-spell classification thresholds ({confidence_status}).",
        },
        LanguageCode.HI: {
            "title": "शुष्क अवधि जोखिम सूचक",
            "summary": (
                "आगामी {horizon_days} दिनों की पूर्वानुमान अवधि के लिए शुष्क अवधि जोखिम सूचक सक्रिय है। "
                "पूर्वानुमान मॉडल लगातार 5 या अधिक सूखे दिनों की {probability_pct}% अंशांकित संभावना दर्शाते हैं।"
            ),
            "risk_indicator": "निगरानी: लगातार 5 या अधिक सूखे दिनों (<1.0 मिमी/दिन) की अवधि की संभावना।",
            "what_it_means": (
                "आगामी {horizon_days} दिनों में मौसम शुष्क रहने के आसार हैं। "
                "खेतों की ऊपरी सतह में मिट्टी की नमी तेजी से घट सकती है।"
            ),
            "confidence_statement": "अंशांकित शुष्क-अवधि वर्गीकरण मानकों के आधार पर मूल्यांकित ({confidence_status})।",
        },
    },
    "AGRO_PADDY_DRY_SPELL_VEGETATIVE_001": {
        LanguageCode.EN: {
            "title": "Paddy Vegetative Stage Moisture Watch",
            "summary": (
                "Paddy vegetative stage dry interval indicator. "
                "Forecast models indicate an elevated ({probability_pct}%) probability of a 5+ day dry interval in the {horizon_days}-day window."
            ),
            "risk_indicator": "Elevated Watch: Extended dry interval during paddy tillering and vegetative growth.",
            "what_it_means": (
                "Tillering paddy has elevated moisture requirements. "
                "A projected {probability_pct}% probability of extended dryness suggests heightened root-zone water stress."
            ),
            "confidence_statement": "Model signal verified against vegetative water requirement criteria ({confidence_status}).",
        },
        LanguageCode.HI: {
            "title": "धान वानस्पतिक अवस्था नमी निगरानी",
            "summary": (
                "धान की वानस्पतिक अवस्था के लिए शुष्क अंतराल सूचक। "
                "पूर्वानुमान मॉडल {horizon_days} दिनों की अवधि में 5+ सूखे दिनों के अंतराल की बढ़ी हुई ({probability_pct}%) संभावना दर्शाते हैं।"
            ),
            "risk_indicator": "सतर्कता निगरानी: धान के कल्ले फूटने और वानस्पतिक वृद्धि के दौरान लंबी शुष्क अवधि।",
            "what_it_means": (
                "कल्ले फूटने के समय धान को पर्याप्त नमी की आवश्यकता होती है। "
                "{probability_pct}% शुष्क अवधि की संभावना से जड़ क्षेत्र में नमी की कमी का जोखिम है।"
            ),
            "confidence_statement": "वानस्पतिक जल आवश्यकता मानकों के अनुसार मूल्यांकित मॉडल संकेत ({confidence_status})।",
        },
    },
    "AGRO_EXTREME_RAIN_ALERT_001": {
        LanguageCode.EN: {
            "title": "Extreme Rainfall Hazard Indicator",
            "summary": (
                "Extreme rainfall risk indicator detected for the {horizon_days}-day horizon. "
                "Forecast models project conditions capable of exceeding the IMD extreme rainfall threshold (204.5 mm / 24h)."
            ),
            "risk_indicator": "High Alert: Risk of catastrophic 24h precipitation exceeding 204.5 mm.",
            "what_it_means": (
                "Very severe atmospheric convective moisture convergence. "
                "Extreme waterlogging and runoff risk for low-lying agricultural fields."
            ),
            "confidence_statement": "Evaluated against operational extreme rainfall detection thresholds ({confidence_status}).",
        },
        LanguageCode.HI: {
            "title": "अत्यधिक वर्षा आपदा जोखिम सूचक",
            "summary": (
                "आगामी {horizon_days} दिनों के लिए अत्यधिक वर्षा जोखिम सूचक सक्रिय है। "
                "पूर्वानुमान मॉडल 24 घंटे में 204.5 मिमी से अधिक वर्षा की स्थिति दर्शाते हैं।"
            ),
            "risk_indicator": "उच्च जोखिम: 24 घंटे में 204.5 मिमी से अधिक अत्यधिक वर्षा का खतरा।",
            "what_it_means": (
                "अत्यंत तीव्र वायुमंडलीय नमी संकेंद्रण। निचले कृषि क्षेत्रों में गंभीर जलभराव और अपवाह का खतरा।"
            ),
            "confidence_statement": "परिचालन अत्यधिक वर्षा पहचान मानकों के अनुसार मूल्यांकित ({confidence_status})।",
        },
    },
    "AGRO_MONSOON_ONSET_INFO_001": {
        LanguageCode.EN: {
            "title": "Monsoon Onset Progression Indicator",
            "summary": (
                "Monsoon onset surge indicator active for the {horizon_days}-day window ({probability_pct}% model signal). "
                "Atmospheric signals indicate potential onset rainfall criteria fulfillment."
            ),
            "risk_indicator": "Informational: Monsoon onset precipitation criteria progression.",
            "what_it_means": (
                "Wind patterns and moisture transport indicate the onset surge is advancing into the district with a {probability_pct}% probability over the next {horizon_days} days."
            ),
            "confidence_statement": "Onset dynamics calibrated against regional climatological criteria ({confidence_status}).",
        },
        LanguageCode.HI: {
            "title": "मानसून प्रारंभ प्रगति सूचक",
            "summary": (
                "आगामी {horizon_days} दिनों की अवधि के लिए मानसून प्रारंभ सूचक सक्रिय है ({probability_pct}% मॉडल संकेत)। "
                "वायुमंडलीय स्थितियां मानसून वर्षा के आगमन के अनुकूल हैं।"
            ),
            "risk_indicator": "सूचनात्मक: मानसून वर्षा आगमन के मानकों की प्रगति।",
            "what_it_means": (
                "हवा की दिशा और नमी का प्रवाह दर्शाते हैं कि आगामी {horizon_days} दिनों में {probability_pct}% संभावना के साथ मानसून का आगमन हो रहा है।"
            ),
            "confidence_statement": "क्षेत्रीय जलवायु मानकों के आधार पर अंशांकित मानसून आगमन प्रक्रिया ({confidence_status})।",
        },
    },
    "AGRO_FALSE_ONSET_RISK_001": {
        LanguageCode.EN: {
            "title": "False Onset Hiatus Risk Indicator",
            "summary": (
                "False onset break risk indicator detected for the {horizon_days}-day window ({probability_pct}% probability). "
                "Initial convective burst may be followed by a prolonged dry hiatus."
            ),
            "risk_indicator": "Watch: Early rainfall burst followed by anticipated >=7 day dry break.",
            "what_it_means": (
                "Early rainfall may be transient. A {probability_pct}% probability of a subsequent prolonged dry break exists within the {horizon_days}-day window."
            ),
            "confidence_statement": "Teleconnection and hiatus dynamics calibrated against historical patterns ({confidence_status}).",
        },
        LanguageCode.HI: {
            "title": "असत्य मानसून प्रारंभ व शुष्क विराम जोखिम सूचक",
            "summary": (
                "आगामी {horizon_days} दिनों के लिए असत्य मानसून प्रारंभ विराम जोखिम सूचक सक्रिय है ({probability_pct}% संभावना)। "
                "शुरुआती वर्षा के बाद लंबी शुष्क अवधि आ सकती है।"
            ),
            "risk_indicator": "निगरानी: प्रारंभिक वर्षा के बाद लगातार >=7 दिनों के शुष्क विराम की संभावना।",
            "what_it_means": (
                "प्रारंभिक वर्षा क्षणिक हो सकती है। आगामी {horizon_days} दिनों में वर्षा के बाद {probability_pct}% संभावना के साथ लंबा सूखा विराम आने का संकेत है।"
            ),
            "confidence_statement": "ऐतिहासिक स्वरूपों के अनुसार अंशांकित टेलीकनेक्शन व विराम गतिशीलता ({confidence_status})।",
        },
    },
    "AGRO_RAINFALL_DEFICIT_ANOMALY_001": {
        LanguageCode.EN: {
            "title": "Substantial Rainfall Deficit Indicator",
            "summary": (
                "Substantial rainfall deficit indicator for the {horizon_days}-day window. "
                "Forecast precipitation departure is {departure_pct}% relative to historical climatological normals."
            ),
            "risk_indicator": "Watch: Large precipitation deficit (<= -50% departure from normal).",
            "what_it_means": (
                "Cumulative rainfall over the {horizon_days}-day window is projected to be {departure_pct}% below the 30-year climatological normal."
            ),
            "confidence_statement": "Anomaly computed relative to historical baseline climatology ({confidence_status}).",
        },
        LanguageCode.HI: {
            "title": "उल्लेखनीय वर्षा कमी सूचक",
            "summary": (
                "आगामी {horizon_days} दिनों के लिए उल्लेखनीय वर्षा कमी सूचक सक्रिय है। "
                "सामान्य की तुलना में पूर्वानुमानित वर्षा में {departure_pct}% की कमी है।"
            ),
            "risk_indicator": "निगरानी: भारी वर्षा कमी (सामान्य से <= -50% का विचलन)।",
            "what_it_means": (
                "आगामी {horizon_days} दिनों में कुल संचयी वर्षा 30-वर्षीय ऐतिहासिक सामान्य स्तर से {departure_pct}% कम रहने का अनुमान है।"
            ),
            "confidence_statement": "ऐतिहासिक आधारभूत जलवायु के आधार पर मूल्यांकित विसंगति ({confidence_status})।",
        },
    },
    "AGRO_RAINFALL_SURPLUS_ANOMALY_001": {
        LanguageCode.EN: {
            "title": "Substantial Rainfall Surplus Indicator",
            "summary": (
                "Substantial rainfall surplus indicator for the {horizon_days}-day window. "
                "Forecast precipitation departure is +{departure_pct}% relative to historical climatological normals."
            ),
            "risk_indicator": "Watch: Large precipitation surplus (>= +50% departure from normal).",
            "what_it_means": (
                "Cumulative precipitation over the {horizon_days}-day window is projected to be +{departure_pct}% above the 30-year climatological normal."
            ),
            "confidence_statement": "Anomaly computed relative to historical baseline climatology ({confidence_status}).",
        },
        LanguageCode.HI: {
            "title": "उल्लेखनीय वर्षा आधिक्य सूचक",
            "summary": (
                "आगामी {horizon_days} दिनों के लिए उल्लेखनीय वर्षा आधिक्य सूचक सक्रिय है। "
                "सामान्य की तुलना में पूर्वानुमानित वर्षा में +{departure_pct}% की वृद्धि है।"
            ),
            "risk_indicator": "निगरानी: भारी वर्षा आधिक्य (सामान्य से >= +50% का विचलन)।",
            "what_it_means": (
                "आगामी {horizon_days} दिनों में कुल संचयी वर्षा 30-वर्षीय ऐतिहासिक सामान्य स्तर से +{departure_pct}% अधिक रहने का अनुमान है।"
            ),
            "confidence_statement": "ऐतिहासिक आधारभूत जलवायु के आधार पर मूल्यांकित विसंगति ({confidence_status})।",
        },
    },
}

DEFAULT_FALLBACK_TEMPLATES: Dict[LanguageCode, Dict[str, str]] = {
    LanguageCode.EN: {
        "title": "Agro-Meteorological Risk Indicator",
        "summary": "Agro-meteorological risk indicator active for the {horizon_days}-day window. Calibrated probability: {probability_pct}%.",
        "risk_indicator": "Informational risk monitoring indicator.",
        "what_it_means": "Meteorological signal indicates anomalous atmospheric conditions over the forecast horizon.",
        "confidence_statement": "Calibrated against historical observations ({confidence_status}).",
    },
    LanguageCode.HI: {
        "title": "कृषि-मौसम जोखिम सूचक",
        "summary": "आगामी {horizon_days} दिनों के लिए कृषि-मौसम जोखिम सूचक सक्रिय है। अंशांकित संभावना: {probability_pct}%।",
        "risk_indicator": "सूचनात्मक जोखिम निगरानी सूचक।",
        "what_it_means": "मौसम संकेत पूर्वानुमान अवधि के दौरान असामान्य वायुमंडलीय स्थितियों को दर्शाते हैं।",
        "confidence_statement": "ऐतिहासिक अवलोकनों के आधार पर अंशांकित ({confidence_status})।",
    },
}


def get_template_for_rule(rule_id: str, lang: LanguageCode) -> Dict[str, str]:
    """Retrieves localized template dictionary for a rule."""
    rule_entry = ADVISORY_TEMPLATES.get(rule_id)
    if rule_entry and lang in rule_entry:
        return rule_entry[lang]
    return DEFAULT_FALLBACK_TEMPLATES.get(lang, DEFAULT_FALLBACK_TEMPLATES[LanguageCode.EN])
