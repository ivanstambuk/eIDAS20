# EUDI Wallet Onboarding: Biometric Checks, PAD, and Relying Party Liability

> **Research Date:** March 26, 2026  
> **Status:** Complete — analysis of the intersection between eIDAS 2.0 European Digital Identity Wallet (EUDIW) PID validation, Anti-Money Laundering (AMLR) obligations, Presentation Attack Detection (PAD), and the distribution of liability during financial sector onboarding.  
> **Context:** Investigating whether a bank (as a Relying Party) is permitted to require a supplementary biometric "selfie" (liveness check) when a customer successfully authenticates using the EUDIW, and how liability for identity fraud is distributed between the Wallet Issuer and the Relying Party under eIDAS 2.0 and AMLR frameworks.

---

## 1. Introduction & Scope

This document analyses the legal, architectural, and liability implications of combining EUDIW cryptograhic assertions with supplementary bank-mandated biometric verification (selfies/liveness checks) during customer onboarding. 

A central tension exists between the eIDAS 2.0 goals of frictionless, data-minimized digital identity (where the EUDIW provides a high Level of Assurance out-of-the-box) and the strict Customer Due Diligence (CDD) obligations imposed on financial institutions by the Anti-Money Laundering Regulation (AMLR) and the revised Payment Services Directive (PSD2/3). 

The central questions addressed are:

1.  **Is a supplementary selfie check an "obstruction"?** — Does eIDAS 2.0's privacy-by-design framework prohibit a bank from asking for an extra biometric check once the PID is securely validated?
2.  **What is the legal coverage for supplementary checks?** — Can an RP legally justify the collection of the `portrait` attribute from the EUDIW to use as a baseline for facial matching?
3.  **Who holds the ultimate liability for identity fraud?** — If a bank chooses to completely trust the EUDIW and skip a liveness check, who pays the regulatory fines if the account is later used for money laundering via a coerced "mule" attack?
4.  **Are supplementary checks actually effective without PAD?** — What type of "extra checks" on the selfie are required by industry standards (e.g., ETSI TS 119 461) to mitigate deepfakes and injection attacks?

The document proceeds top-down: **regulatory basis (§2) → the obstruction debate and data minimization (§3) → liability and risk distribution (§4) → deeper technical necessity of PAD (§5) → ETSI standardization (§6) → operational conclusions for RPs (§7)**.

**Key finding:** eIDAS 2.0 explicitly permits Relying Parties to apply higher levels of security than the EUDIW provides (Article 5b(8)). Asking for a selfie check is **not an obstruction** of the regulation, provided it is justified under the RP's AML risk framework. More importantly, **the bank retains full liability** for Customer Due Diligence failures; eIDAS shifts liability for *forged credentials* to the Issuer, but does not shield the bank from *presentation attacks* (where a legitimate EUDIW is used under duress or by a bad actor). Therefore, financial institutions are highly incentivized to augment EUDIW onboarding with ETSI-compliant Presentation Attack Detection (PAD).

---

## 2. Regulatory Basis: The Intersection of eIDAS 2.0 and AMLR

The friction surrounding EUDIW bank onboarding stems from two parallel regulatory frameworks with distinct objectives: eIDAS 2.0 (maximizing interoperability and data minimization) and AMLR (maximizing risk detection and fraud prevention).

### 2.1 eIDAS 2.0 (Regulation (EU) 2024/1183)

eIDAS 2.0 introduces the EUDIW to provide an electronic identification means with a Level of Assurance (LoA) "High." 

> **Article 5b(8):** *"Nothing in this Article shall prevent a relying party from applying a higher level of security in the authentication of the user than the level of security applied to the European Digital Identity Wallet, or from applying a different level of security to the authentication of the user for the provision of an online service."*

This is the foundational clause for supplementary checks. It confirms that the EUDIW establishes a *baseline* of trust, but does not represent a regulatory *ceiling* on the friction an RP can introduce if their sector demands it.

### 2.2 The `portrait` Attribute in PID (CIR 2024/2977)

The Person Identification Data (PID) set defines the core attributes a citizen can present. Commission Implementing Regulation (EU) 2024/2977 specifies the PID data set:

| Attribute | Description | M/O |
| :--- | :--- | :--- |
| `family_name` | Current family name(s) | Mandatory |
| `given_name` | Current given name(s) | Mandatory |
| `birth_date` | Date of birth | Mandatory |
| `portrait` | Facial image of the wallet user compliant with ISO 19794-5 or ISO 39794 | **Optional** |

Because `portrait` is an optional attribute in the PID standard, Relying Parties must explicitly request it. To avoid violating GDPR and eIDAS data minimization rules, the RP must have a lawful basis. 

### 2.3 Anti-Money Laundering Regulation (AMLR) and Customer Due Diligence

Financial institutions are strictly bound by the AMLR, which mandates Customer Due Diligence. A core tenant of CDD is a **Risk-Based Approach (RBA)**. 

If a bank's internal threat modeling concludes that remote onboarding presents a high risk of "mule accounts" (where vulnerable individuals are coerced into opening accounts on behalf of criminal syndicates), the bank is legally obligated to introduce compensating controls. 

*   **EUDIW's role in AMLR:** AMLR directly recognizes notified eID schemes (like the EUDIW) as independent and reliable sources for identity verification. 
*   **The limitation:** EUDIW guarantees the data belongs to the person named. It does **not** guarantee the person is acting of their own free will during the transaction, nor does it definitively prove the device hasn't been remotely hijacked (e.g., via a Remote Access Trojan).

---

## 3. The "Obstruction" Debate and Data Minimization

A common concern among Relying Parties is whether introducing a selfie check violates the "obstruction" or "non-discrimination" principles of eIDAS.

### 3.1 What Constitutes Obstruction?

eIDAS 2.0 requires that RPs must not discriminate against users who cannot or choose not to use the EUDIW (e.g., providing alternative onboarding paths). It also mandates that the wallet experience must be seamless.

However, **friction is not obstruction if it is legally justified.** 

If a bank mandates a liveness selfie check for *all* high-risk remote onboarding (whether the user verifies via EUDIW, traditional video-identification, or eID), they are applying a uniform, risk-based AML control. This is not penalizing the EUDIW user; it is satisfying a separate regulatory requirement.

### 3.2 Relying Party Registration and Selective Disclosure

To legally request the `portrait` attribute from the EUDIW to use as a baseline for the selfie check:
1.  The bank must declare the `portrait` attribute in its **Relying Party Registration** (Article 5b(2)).
2.  The intended use must explicitly state it is for "Biometric liveness matching for Anti-Money Laundering compliance."
3.  The Wallet User interface will display this request to the citizen, enforcing "sole user control" and Selective Disclosure. 

If the user consents, there is no over-collection. 

---

## 4. Liability Deep Dive: Who Owns the Risk?

The most critical question for financial institutions evaluating EUDIW integration is the distribution of liability. 

### 4.1 Issuer Liability: The "Authenticity" Shield (Article 11)

Under eIDAS 2.0 (Article 11), the issuer of the EUDIW and the Qualified Trust Service Providers (QTSPs) bear liability for damages caused intentionally or negligently due to a failure to comply with their obligations. 

*   **What this means:** If the Member State issues a PID to an imposter because the state registry was compromised, or if the QTSP signs a false credential—and a bank relies on this faulty credential to open an account—the **Issuer/State** is liable. The bank is shielded against "synthetic identity fraud" originating upstream.

### 4.2 Relying Party Liability: The "Presentation" Gap (PSD2/AMLR)

eIDAS 2.0 deals with *transaction* and *authenticity* liability. It does **not** override sector-specific liability regarding financial fraud.

If a bank chooses to rely **solely** on the EUDIW (skipping the selfie check) for a frictionless user journey, they incur a specific attack surface: **Presentation Attacks and Coercion**.

| Scenario | Attack Vector | Resulting Liability | Why? |
| :--- | :--- | :--- | :--- |
| **Coerced Mule** | Citizen is physically forced to unlock their EUDIW and share PID with the bank. | **Bank (Relying Party)** | AMLR mandates banks detect suspicious onboarding. The EUDIW credential was authentic, so the Issuer is blameless. The bank failed to apply adequate CDD friction. |
| **Relay / Phishing** | Fraudster tricks user into approving a PID presentation request initiated from the fraudster's device. | **Bank (Relying Party)** | PSD2 Strong Customer Authentication (SCA) liability falls on the PSP if they fail to properly bind the transaction to the user's explicit intent. |
| **Malware / RAT** | User's smartphone is infected; malware automates the EUDIW consent flow. | **Bank (Relying Party)** | Again, the bank's fraud detection engine failed to detect the remote access. |

**Conclusion on Risk Ownership:** The bank owns the ultimate risk of financial fraud if the `selfie` check is skipped. The EUDIW eliminates *document forgery* risk, but it does not eliminate *session hijack* or *coercion* risk. Therefore, relying solely on EUDIW without supplementary checks in high-risk scenarios is an untenable risk posture for most regulated financial entities.

---

## 5. Supplementary Checks: Why a "Selfie" is Not Enough (PAD)

If a bank determines that supplementary biometric checks are necessary to shield themselves from AML liability, they must evaluate the quality of those checks. A simple "selfie" comparison against the EUDIW `portrait` is highly vulnerable to modern Generative AI attacks.

### 5.1 Presentation Attack Detection (PAD)

To bridge the gap between the EUDIW's cryptographic assurance and physical human presence, the supplementary check must include **PAD**.

*   **Level 1 (Basic Liveness):** Detecting that the input is a 3D object, not a printed photo or high-res screen replay (detects basic spoofing).
*   **Level 2/3 (Advanced PAD):** Detecting silicone masks, deepfakes, and sophisticated physical presentation attacks. 
*   **Active vs Passive liveness:** Active requires the user to move (smile, blink, turn head), which introduces UX friction but proves real-time presence. Passive analyzes micro-texture and depth seamlessly.

### 5.2 Deepfakes and Injection Attacks (Camera Bypass)

The greatest emerging threat to digital onboarding is the **Injection Attack**. 
*   **The Attack:** A fraudster bypasses the smartphone's physical camera sensor entirely, utilizing a virtual camera driver or hooking the OS level to inject pre-rendered, AI-generated synthetic video (a Deepfake derived from the victim's public photos or stolen `portrait` data).
*   **The Defense:** The "extra check" must include telemetry validation (verifying the video feed originates from the physical CMOS sensor), illumination analysis, and cryptographic binding of the media stream.

If a bank requests a selfie but does not utilize injection attack detection, they are still liable under AMLR when the deepfake succeeds. 

---

## 6. ETSI Standards Integration (TS 119 461)

When determining the legal adequacy of supplementary checks, regulators rely on industry standards. 

**ETSI TS 119 461** (*Policy and security requirements for trust service components providing identity proofing*) is the gold standard in Europe. 

While originally designed for Trust Service Providers issuing certificates, National Competent Authorities (NCAs) frequently apply ETSI TS 119 461 principles to banks evaluating AML compliance. 

*   ETSI mandates that remote identity proofing must include mechanisms to detect presentation attacks (PAD).
*   If a bank leverages the EUDIW (satisfying the document verification requirement of ETSI) but skips the PAD liveness check, they may fall short of the overall ETSI identity proofing standard. 
*   Therefore, an ETSI-compliant selfie liveness check is not just "allowed"—it is actively recommended to establish a legally defensible onboarding process.

---

## 7. Synthesis and Operational Strategy for Relying Parties

For corporate groups, banks, and payment service providers evaluating EUDIW integration, the operational strategy regarding supplementary selfies is clear:

1.  **Do not treat EUDIW as a silver bullet for AML:** It solves the identity authenticity problem (LoA High), but not the liveness/coercion problem. 
2.  **Register to request the `portrait`:** Ensure your EUDIW RP registration explicitly declares the `portrait` attribute and links the request to your AML/CDD legal obligations. 
3.  **Implement ETSI-grade PAD:** A supplementary check must utilize Presentation Attack Detection to stop injection attacks and deepfakes. A vanilla selfie comparison is insufficient.
4.  **Accept the Liability Reality:** Recognize that eIDAS 2.0 shifts liability *upstream* to governments for the data, but PSD2/AMLR keeps the liability *downstream* on the bank for the transaction. The selfie check is the firewall protecting the bank's liability.

### Summary Table: Security vs Friction Balance

| Approach | EUDIW Only (No Selfie) | EUDIW + Basic Selfie | EUDIW + ETSI-Grade PAD |
| :--- | :--- | :--- | :--- |
| **UX Friction** | Lowest (Seamless) | Medium (1 extra step) | High (Active/Passive Liveness) |
| **Data Authenticity (eIDAS)** | High (Cryptographic) | High | High |
| **Coercion / Mule Defense** | None | Low | High |
| **Deepfake / Injection Defense** | N/A | None | High |
| **RP Liability Risk (AMLR)** | **CRITICAL** | High | Low |
| **eIDAS 2.0 Compliance** | 100% Compliant | 100% Compliant (Art 5b.8) | 100% Compliant (Art 5b.8) |

---

## 8. Broader Industry Ecosystem Debates & Open Questions

As Relying Parties and Payment Service Providers (PSPs) move toward implementing eIDAS 2.0, the tension between friction and liability has sparked significant debate across architecture forums, GitHub repositories (e.g., ARF, `open-eid/eudi-wallet-poc`), and regulatory FAQ sessions.

### 8.1 The OpenID4VP Friction Dilemma
A core technical challenge debated in the eIDAS Architecture and Reference Framework (ARF) GitHub discussions is how to seamlessly integrate Presentation Attack Detection (PAD) into the OpenID for Verifiable Presentations (OID4VP) flow. 
*   **The Problem:** The EUDIW is marketed to citizens as a "1-click" frictionless onboarding experience. If a Relying Party mandates a live selfie+PAD, it reintroduces the exact User Experience (UX) friction (camera access permissions, lighting requirements, algorithmic rejection rates) the Wallet was designed to eliminate, potentially harming adoption rates.
*   **The Compromise:** Experts suggest that standard onboarding for low-risk products may proceed with pure EUDIW (frictionless), while high-risk scenarios (e.g., establishing a new cross-border banking relation) trigger a conditional "step-up" PAD flow within the Relying Party app.

### 8.2 Cross-Border Liability Voids and PSD2/PSR
While eIDAS 2.0 clearly defines liability for Qualified Trust Service Providers (QTSPs) and Issuers, the payment industry FAQ documents and legal opinions have highlighted an unaddressed gap regarding cross-border financial fraud.
*   If an EUDIW issued by Member State A is used to fraudulently open an account or authorize a payment at a PSP in Member State B, it is highly complex for the PSP to seek restitution from the foreign issuer.
*   Because the updated Payment Services Regulation (PSR) and PSD3 continue to place the burden of refunding unauthorized transactions strictly on the PSP, banks are incentivized to trust their own proprietary liveness checks over a foreign Wallet's baseline authentication, cementing the necessity of the "extra check."

### 8.3 Inherence vs. Possession in SCA
A persistent debate in the financial sector revolves around mapping the EUDIW to Strong Customer Authentication (SCA) factors.
*   The EUDIW acts as the "possession" factor. If the citizen unlocks the wallet using FaceID or TouchID, it theoretically satisfies the "inherence" (biometric) factor.
*   However, PSPs argue that relying completely on the device's local biometric unlock mechanism is insufficient for high-value transactions because the bank has zero control over the device's security enclave (e.g., a user adding an accomplice's face to their local phone settings). 
*   This reinforces the bank's operational requirement to perform a separate, server-side liveness selfie check to definitively establish "inherence" outside the EUDIW's control.

---

## 9. References

### Legal & Regulatory Texts (EUR-Lex)
* **eIDAS 2.0 Regulation:** [Regulation (EU) 2024/1183](https://eur-lex.europa.eu/eli/reg/2024/1183/oj) amending Regulation (EU) No 910/2014 as regards establishing the European Digital Identity Framework.
* **AMLR (Anti-Money Laundering Regulation):** [Regulation (EU) 2024/1624](https://eur-lex.europa.eu/eli/reg/2024/1624/oj) on the prevention of the use of the financial system for the purposes of money laundering or terrorist financing.
* **PID Data Set (Implementing Act):** [Commission Implementing Regulation (EU) 2024/2977](https://eur-lex.europa.eu/eli/reg_impl/2024/2977/oj) laying down rules for person identification data and electronic attestations of attributes.
* **PSD2 (Strong Customer Authentication):** [Directive (EU) 2015/2366](https://eur-lex.europa.eu/eli/dir/2015/2366/oj) on payment services in the internal market.

### Technical Standards & Frameworks
* **ETSI TS 119 461:** [Policy and security requirements for trust service components providing identity proofing](https://www.etsi.org/deliver/etsi_ts/119400_119499/119461/01.01.01_60/ts_119461v010101p.pdf).
* **Architecture and Reference Framework (ARF):** [European Digital Identity Wallet Architecture and Reference Framework](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework) (EU Commission).
