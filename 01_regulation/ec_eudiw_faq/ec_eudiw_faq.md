> **Source:** [EC Digital Building Blocks — EUDIW FAQ](https://ec.europa.eu/digital-building-blocks/sites/spaces/EUDIGITALIDENTITYWALLET/pages/713526976/FAQ)  
>
> **Last Updated:** 2026-02 (import date; source last updated 2026-02-16)  
>
> **Category:** Guidance  
>
> **Note:** This is a one-time import of the official EU Digital Identity Wallet FAQ from the EC Digital Building Blocks Confluence space. Content is preserved verbatim per DEC-092.

# EU Digital Identity Wallet FAQ

Frequently Asked Questions about the European Digital Identity Framework. These questions are intended for a professional and technical audience from both the private and public sector who are involved with the EU Digital Identity Wallet Ecosystem.

They should provide clarity on the legal and technical requirements required for the successful implementation of the European Digital Identity Wallets and electronic identification means.

> These questions and answers serve for informational purposes only and do not constitute legal advice. The definitive interpretation of EU law remains the prerogative of the Court of Justice of the European Union.


---

## General

### What are EU Digital Identity Wallets?

EU Digital Identity Wallets are personal digital wallets, in the form of apps allowing citizens to digitally prove who they are, as well as store and manage identity data and official documents in digital form. These may include a driving licence, or educational qualifications.

Many citizens are already using digital wallets on their mobile phones to store their boarding passes and show them when they travel or to keep their virtual bank cards to proceed with convenient payments. These wallets, often offered by online platforms, allow their users to log in to various online services from shopping to reading news but these logins are not necessarily giving users full control over what data they share to identify themselves while accessing online services. These “social logins” can rarely can be used to access digital government services. With the EU Digital Identity Wallets, all European citizens will be able to prove, across the EU, their identity where necessary to access public and private digital services, to share digital documents, or simply to prove a specific personal attribute, such as age, without revealing their full identity or other personal details. Citizens will at all times have full control of the data they share and with whom.

---

### Will I have to pay for EU Digital Identity Wallets?

For natural persons, the use of the wallets, including electronic signatures for non-professional purposes, will be free of charge. Businesses may have to pay fees to use the wallet services, depending on Member States' choice of business model for the wallet. This may mean in practice for instance that service providers, such as telecom operators or credit card companies may be asked to pay when they rely on identification services the wallets will offer to onboard to new mobile phone contracts or credit cards. Using the wallets for sharing digital documents may also incur costs to the providers of these documents.

---

### Will I have to pay to use an EU Digital Identity Wallet?

No, EU Digital Identity Wallets will be completely free for citizens, including signing private documents electronically with your wallet for non-professional use cases. Some certificates shared through the wallet may require payment to the provider, such as educational certificates, credit statements or business certificates – similar to the situation today where obtaining such certificates in paper form also sometimes comes at a cost.

---

### How can I obtain an EU Digital Identity Wallet?

Member States have the choice to offer the wallets to their citizens and residents at the national level directly themselves, or to mandate another organisation with provision or recognise an independent provider. Everyone will be able to download, install and use EU Digital Identity Wallets on their personal mobile device. Member States can make use of existing national digital eID schemes to facilitate registering citizens for the wallets (with the help of additional security measures where necessary).

---

### When will I be able to use  EU Digital Identity Wallets?

Member States should issue EU Digital Identity Wallets 24 months after adoption of the implementing legislation setting out the core functions of the wallet and its certification. Indicatively, this means wallets will be available to citizens in 2026.

---

### Where can I download a wallet?

Wallets are not yet available. In the future, you will be able to find the wallet in major mobile app stores (iOS, Android), clearly labelled as official EU Digital Identity Wallets.

---


---

## European Digital Identity Wallets

### What is the difference between a wallet solution and a wallet unit?

Both a wallet solution and a wallet unit are provided by a wallet provider and contain the same basic components; wallet instances, wallet secure cryptographic applications, and wallet secure
cryptographic devices.


The definitions are laid down in Article 2(11) and 2(2) of the [Commission Implementing Regulation (EU) 2024/2979.](#/regulation/2024-2979)

A **‘wallet solution’** means a combination of software, hardware, services, settings, and configurations, including wallet instances, one or more wallet secure cryptographic applications and one or more wallet secure cryptographic devices.

 A **‘wallet unit’** means a unique configuration of a wallet solution that includes wallet instances, wallet secure cryptographic applications and wallet secure cryptographic devices provided by a wallet provider to an individual wallet user.

In simple terms, the wallet solution is the master template, and the wallet unit is the individual version customised for each user.

---

### Where can the technical requirements for EU Digital Identity Wallets be found?

The technical requirements for the EU Digital Identity Wallets can be found in the adopted implementing acts:

- [Commission Implementing Regulation (EU) 2024/2979](#/regulation/2024-2979) as regards the integrity and core functionalities of European Digital Identity Wallets

- [Commission Implementing Regulation (EU) 2024/2982](#/regulation/2024-2982) as regards protocols and interfaces to be supported by the European Digital Identity Framework

- [Commission Implementing Regulation (EU) 2024/2977](#/regulation/2024-2977) as regards person identification data and electronic attestations of attributes issued to European Digital Identity Wallets

- [Commission Implementing Regulation (EU) 2024/2980](#/regulation/2024-2980) as regards notifications to the Commission concerning the European Digital Identity Wallet ecosystem

- [Commission Implementing Regulation (EU) 2024/2981](#/regulation/2024-2981) as regards the certification of European Digital Identity Wallets

- [Commission Implementing Regulation (EU) 2025/847](#/regulation/2025-0847) as regards reactions to security breaches of European Digital Identity Wallets

- [Commission Implementing Regulation (EU) 2025/849](#/regulation/2025-0849) as regards the submission of information to the Commission and to the Cooperation Group for the list of certified European Digital Identity Wallets

- [Commission Implementing Regulation (EU) 2025/846](#/regulation/2025-0846) as regards cross-border identity matching of natural persons

- [Commission Implementing Regulation (EU) 2025/848](#/regulation/2025-0848) as regards the registration of wallet-relying parties

- [Commission Implementing Regulation (EU) 2025/1569](#/regulation/2025-1569) as regards qualified electronic attestations of attributes and electronic attestations of attributes provided by or on behalf of a public sector body responsible for an authentic source
Further, the common technical architecture of the EU Digital Identity Wallets ecosystem is defined in the Architecture and Reference Framework (ARF) document. The ARF has been set-up pursuant to [Commission Recommendation (EU) 2021/946](#/regulation/2021-946) and sets out a set of common standards, and technical specifications for components, protocols, interfaces and data formats governing information exchange between issuers, wallets, and service providers.

The ARF is published [here.](https://digital-strategy.ec.europa.eu/en/library/implementing-regulation-european-digital-identity-wallets?utm_source=chatgpt.com)

---

### Are there libraries/source code available for the EU Digital Identity Wallets?

The EU Digital Identity Wallet reference implementation enables Member States and stakeholders to develop their own wallets.

It includes open-source code libraries, modular components, and a fully functional reference application built in line with the ARF.


The implementation is available on GitHub and includes demo apps for both iOS and Android, allowing users to test key features such as credential issuance and proximity-based verification. Find
the reference implementation
[here.](https://github.com/eu-digital-identity-wallet/.github/blob/main/profile/reference-implementation.md#eudi-wallet-reference-implementation)

---

### Will wallets be able to prove that a user has delegated mandate powers (i.e., power of attorney or representation rights)?

Wallets will be used to store any type of electronic attestations of attributes (EAAs). These EAAs can attest to any kind of delegations, such as representation rights or powers of attorney.


However, it should be noted that the legal meaning and validity of such delegations is not regulated nor standardised in Regulation (EU) No 910/2014.


Thus, while wallets may be used to store and exchange delegations, like any other electronic attestations of attributes, their creation, interpretation or use will depend on the context in which
they are used.

---

### What is selective disclosure of attributes?

Selective disclosure of attributes is a data minimisation feature that enables wallet users to only share the specific information requested by a relying party without revealing additional
information. This is one of the ways in which wallets help to comply with the data protection principles enshrined in Regulation (EU) 2016/679 (the ‘GDPR’), in particular the principles of data
minimisation and purpose limitation. More generally, this feature allows users to have control over their personal data.


For example, a user could share their date of birth without revealing their place of birth, allowing for greater privacy while still enabling access to digital services.

---

### How will users of the EU Digital Identity Wallets be able to sign electronically?

The EU Digital Identity Wallets shall enable their users to create qualified electronic signatures.


To sign electronically using an EU Digital Identity Wallet, the wallet user will be issued a qualified certificate for electronic signatures, which is linked to a qualified electronic signature
creation device. That device can be embedded in the wallet or in the mobile device of the user, be external but handled by the user, or be a remote qualified electronic signature creation device.



The wallet user will have access to a signature creation application which may either be integrated in the wallet instance, be a separate app on the wallet user’s device, or be provided remotely.

---

### What is a provider of person identification data?

The definition is laid down in Article 2(4) of the
[Commission Implementing Regulation (EU) 2024/2977.](#/regulation/2024-2977)



Providers of person identification data (or PID) are responsible for issuing and revoking the person identification data and ensuring that the person identification data of a user is cryptographically bound to a wallet unit. These can be public sector bodies, e.g. a Ministry or national register, or recognised private entities that are entrusted with the provision of personal information, like a name and date of birth to be used for identification, to the wallet unit.

---

### Will end users be charged for person identification data issuance?

Article 5a(13) of the European Digital Identity Regulation (or ‘Regulation’) explicitly states that the issuance, use, and revocation of the European Digital Identity Wallets (‘wallets’) are to be
free of charge for all natural persons. Although the term "wallet issuance" is not explicitly defined in the European Digital Identity Regulation, it can be considered to refer to the creation and
provision of the wallet solution by a wallet provider.



In addition, as an electronic identification means, the wallet shall allow the user to securely store, manage and validate PID further to Article 3(42). The issuance of PID to a user’s wallet can
also be considered a necessary precondition that the identification function of the wallet can be used.


As a result, it can be deducted that the issuance of PID should be free of charge.

---

### How are EU Digital Identity Wallets protected against fraud?

To prevent or minimise fraud, EU Digital Identity Wallets are highly secure as they will:


- 
be certified against level of assurance “high” requirements by accredited public or private bodies designated by Member States, ensuring high standards for privacy and security; be private by
design - users will always have control over which data they share;


- implement robust security protocols with assurance level high, strong encryption, and multi-factor authentication;

- include the wallet secure cryptographic device (WSCD) architecture, ensuring a secure environment and storage for cryptographic assets (such as cryptographic keys for authentication).

---

### How is a high standard of privacy for European Digital Identity Wallets ensured in all Member States?

Personal data protection and privacy are cornerstones of Regulation (EU) No 910/2014 which applies without prejudice to the GDPR. Regulation (EU) No 910/2014 lays down provisions that reinforce
the application of the GDPR, such as Article 5a(16) of that Regulation about the technical framework of the EU Digital Identity Wallets. Further, the implementing acts to Regulation (EU) No
910/2014 as regards wallet functionalities also provide technical specifications and privacy enhancing techniques ensuring data protection and privacy.



To ensure personal data protection by design and by default, the wallets should use available state-of-the-art privacy enhancing techniques. Among others, these features should provide the
possibility that wallets can be used without the wallet users being trackable across different wallet-relying parties, if applicable to the usage scenario.



The EUDI Wallet architecture embodies the principle of privacy by design. This means that the protection of user data is a fundamental pillar of the architecture's design. In this context, the
principle of data minimisation guides the collection of personal information, ensuring that relying parties gather only the attributes they need and have registered for. To support the selective
disclosure of attributes, the wallets empower users with granular control over what data is presented and to whom. Secure coding practises are mandated, and the architecture itself minimises
attack surfaces by compartmentalising sensitive data and access controls. For more information on this topic, please refer to sections 4.2.4 and 4.2.5 of the Architecture and Reference Framework.

---

### Which information is required for wallet-relying party registration?

In a nutshell, each wallet-relying party is required to provide the following information:


- 
**Identification information:** Name, identifiers as stated in the official record together with identification data of the official record (e.g., EORI, registration number in a
national business register, VAT, LEI).


- **Address:** Physical address of the wallet-relying party

- **URL:** An URL belonging to the wallet-relying party.

- **Country code indicator:** The country indicator of the Member State where the wallet-relying party is established.

- **Contact details:** A valid email address, phone number, and website.

- **Service description:** An outline of the services provided and the intended use of wallet user attributes.

- **Attribute usage:** A list categorising the attributes to be requested as mandatory or optional.

- **A list of the data,** including attestations and attributes that the wallet-relying party intends to request.

- **Intended use:** A description of intended use of the data that the wallet-relying party intends to request from wallet units.

- An indication of whether the wallet-relying party is a **public sector body.**

- 
**Entitlements:**Details of any specific roles in trust services provision, where applicable. This information is submitted to the Member State’s registrar and published to maintain
transparency.




Please refer to [Commission Implementing Regulation (EU) 2025/848](#/regulation/2025-0848) for further details and updates on the requirements
above.

---

### What are pseudonyms, and how are they used?

In the context of the EU Digital Identity Wallets, pseudonyms are unique, wallet-specific identifiers that can be chosen by the user and used for interactions with a specific relying party. They
help preventing user tracking across services while enabling seamless authentication.



In accordance with the state of the art, pseudonym generation follows WebAuthn standards and is designed to limit data exposure during transactions. Please refer to Article 14 of
[Commission Implementing Regulation (EU) 2024/2979](#/regulation/2024-2979) for further details.

---

### What is wallet certification and who certifies the wallets?

Wallet certification is the formal process by which EU Digital Identity Wallets are evaluated to ensure they meet functional and cybersecurity standards. This process is further specified by European cybersecurity certification schemes and national certification schemes.

This process ensures that the security, reliability and interoperability of the wallets are assessed in order to foster trust among users and service providers. 

Wallets are certified by accredited conformity assessment bodies operating under national certification schemes and designated by Member States.

These bodies are responsible for evaluating wallet solutions against functional and cybersecurity requirements, conducting testing and assessments, and issuing certificates of conformity. They operate under the oversight of national certification scheme owners and ensure alignment with EU standards.

For further details, please refer to [Commission Implementing Regulation (EU) 2024/2981](#/regulation/2024-2981), and [Commission Implementing Regulation (EU) 2025/849.](#/regulation/2025-0849)

---

### How will security breaches—whether affecting wallets, authentication mechanisms, or electronic identification (eID) schemes— be addressed?

A severe breach or compromise will result in the immediate withdrawal of all affected wallets, authentication mechanisms or electronic identification (eID) schemes.  For further details please refer to [Commission Implementing Regulation (EU) 2025/847.](#/regulation/2025-0847)

---

### What is the difference between “strong customer authentication” (SCA) as referred to in Directive (EU) 2015/2366 (PSD2) and “strong user authentication” as referred to in the European Digital Identity Regulation?

In the context of Regulation (EU) No 910/2014, the term "strong user authentication" is used instead of "strong customer authentication" (SCA), which is a concept used in Directive (EU) 2015/2366 (PSD2). Since EU Digital Identity Wallets are provided free of charge and do not involve customers in the traditional sense, Regulation (EU) No 910/2014 consistently refers to their holders as "users" instead of “customers”. Although the terms differ, both refer to the same underlying concept, a multi-factor authentication process that ensures secure and reliable user authentication and should therefore be considered as synonyms in this context.

---

### Is there an obligation to accept EU Digital Identity Wallets in the area of banking and financial services?

As per Article 5f(2) of Regulation (EU) No 910/2014, certain private relying parties are required to accept the wallets, upon request of the user, where Strong Customer Authentication (SCA) is required by Union or national law, or by contractual obligation. For example, under the PSD2 Directive, payment service providers are required to apply SCA in specific situations. This obligation to accept the wallets upon request of the user applies 36 months after the entry into force of the implementing acts referred to in Article 5a(23) and Article 5c(6) of Regulation (EU) No 910/2014.

---

### How can payment service providers in practice fulfil their obligation to recognise the European Digital Identity Wallets to apply Strong Customer Authentication (SCA)?

Regulation (EU) No 910/2014 does not prescribe  how service providers should fulfil their obligation to recognize the European Digital Identity Wallet to apply Strong Customer Authentication (SCA).

However, large scale pilots have tested and developed the following way how payment service providers can fulfil their obligations under Art. 5f(2) of Regulation (EU) No 910/2014:

Payment Service Providers issue a dedicated SCA attestation after carrying out a secure authentication of the user and linking users to their specific payment account and payment instrument.

In this model, the payment service provider acts as both the issuer of the SCA attestation and the verifier. It should retain full control over the authentication decision, remaining able to authenticate the user independently. The payment service provider should remain fully responsible for validating the attestation and ensuring compliance with applicable regulations.

The following detailed process has been developed by large-scale pilots in this context:

- Before the SCA attestation is issued to the user’s wallets, the user completes a registration process under the control of the payment service provider. This process begins when the user requests their wallets to be registered for a specific payment account and payment instrument.

- The payment service provider authenticates the user through an existing PSD2-compliant method.

- The wallets generate a cryptographic key pair: the private key is securely stored and used to sign messages, while the corresponding public key is shared with the payment service provider for verification purposes.

- The payment service provider issues an individual SCA attestation into the user’s wallets. This attestation is device-bound, ensuring usage is linked to the user’s keys on that device, and requires multi-factor authentication to activate the signing key. The resulting cryptographic signatures can then be verified by the payment service provider to securely authenticate transactions.

- Following this registration, the wallets can be used to present the SCA attestation when SCA is required, together with transaction-specific details for the user to confirm. The confirmation is cryptographically bound to the transaction and allows for dynamic linking, ensuring that authentication is directly tied to the transaction details, such as the specific amount and a specific payee, and that these details are protected from tampering.

- The SCA attestation and the transaction data can be shared with the payer’s payment service provider, supporting various use cases and allowing additional attributes, such as age verification, to be combined with the payment data.

A description of this process can be retrieved at the following link: [Directive - 2015/2366 - EN - Payment Services Directive - EUR-Lex.](https://eur-lex.europa.eu/eli/dir/2015/2366/oj)

---

### Are outsourcing agreements necessary between payment service providers and wallets providers for applying SCA using the wallets? Does the use of the wallets for SCA require the delegation of the authentication?

Outsourcing agreements between payment service providers and wallets providers are not required under Regulation (EU) No 910/2014 for the implementation of the wallets for SCA. 

Where payment service providers act as both issuer of the SCA attestation and verifier, they should retain full control over the authentication decision and remain fully responsible for validating the attestation and ensuring compliance with applicable regulations.

In this model, the wallets act as a secure carrier of the attested information. Given that payment service providers are responsible for issuing and relying upon attestations for SCA, a delegation of the authentication to a third party does not take place.

---

### What are the requirements regarding the acceptance of the EU Digital Identity Wallets by Very Large Online Platforms (‘VLOPs’)?

Article 5f(3) of the Regulation (EU) No 910/2014 requires providers of VLOPs, as referred to in Article 33 of Regulation (EU) 2022/2065 (the ‘DSA’), that require user authentication for accessing their online services, to facilitate and accept the use of EU Digital Identity Wallets. 

Whenever VLOPs require user authentication for access to online services, such as logging in, account creation, or identity verification processes, they shall enable users upon request, to voluntarily use EU Digital Identity Wallets for such authentication purposes. Consequently, providers of VLOPs shall ensure technical compatibility with EU Digital Identity Wallets. 

To support user privacy and strengthen data protection, the EU Digital Identity Wallets will support the WebAuthn standard, acting as passkey providers to enable secure, passwordless authentication and the use of relying party-specific pseudonyms, when interacting with VLOPs.

---


---

## Electronic Identification Schemes

### What are the requirements for Member States intending to pre-notify their national electronic identification scheme?

The objective of Regulation (EU) No 910/2014 is to streamline the peer review procedures for electronic identification schemes, relying on certification in order to foster cooperation among Member States on the security and interoperability of their notified electronic identification schemes.

Therefore, Article 12a of Regulation (EU) No 910/2014 provides that electronic identification schemes to be notified shall by certified by designated conformity assessment bodies against the cybersecurity requirements set out in Article 8(1) of the Regulation. However, certification against non-cybersecurity requirements is optional. Consequently, the peer-review process shall not apply to electronic identification schemes or parts of such schemes which are certified. However, the parts of the scheme which are not covered by certification must be peer reviewed.

---

### What is the legal effect of the notification of an electronic identification scheme?

All notified electronic identification schemes must be recognised across the Union which means any Member State that, either through administrative practice or by law, relies upon electronic identification for authentication to their electronic services, must also accept the use of a notified electronic identification means issued in another Member State.

However, in some cases the service a user wishes to access may require further information that is not available through the electronic identification means to complete the identification process. 

To reduce cases where users are asked for additional information, Member States, when acting as relying parties for cross-border services, are obliged to provide identity matching services that ensure a smooth identification process. These services match the information available through the electronic identification means with information already stored either in that Member State, e.g. if a person has received an electronic identification means from that Member State or if they were previously a resident of that Member State.

---


---

## Wallet Usage

### Could I use  EU Digital Identity Wallets  to access private services?

Yes, EU citizens should be able to use their EU Digital Identity Wallets to access digital services all across the Internet, including certain private services. As such, they improve the effectiveness and extend the benefits of secure and convenient digital identity to the private sector. Providers of some private services must accept the wallets at the request of the wallet user, notably where strong user authentication is required. This is for instance the case for making payments, for opening bank accounts and for other use cases such as in the areas of transport, energy, insurance, drinking water, postal services, digital infrastructure, education or telecommunications. A requirement to recognise the EU Digital Identity Wallets for authentication also applies to Very Large Online Platforms.

---

### Will public services support and accept digital signatures?

Yes, public services must accept qualified electronic signatures for cross-border use as equal to paper signatures. There may be some exceptions at national level.

---

### Will it be easy for me to create digital signatures with an EU Digital Identity Wallet?

Everyone who has fully set up their EU Digital Identity Wallet will be able to sign electronically with just a few clicks.

---

### Could I use an EU Digital Identity Wallet for banking services?

Yes, citizens will be able to use EU Digital Identity Wallets to authorise payments, open financial services accounts and other services in full security with personal data protected. In all these cases, the wallets will not replace, but complement solutions offered by banks.

---

### How will the systems be interoperable and work across different Member States?

The Regulation imposes common functional requirements for all EU Digital Identity Wallets issued by Member States.

The Commission is working closely with Member States to develop common standards, technical specifications and protocols needed to ensure that all wallets meet these requirements, operate in the same way across the EU and offer the same required functionalities, security and data protection features.

The technical specifications will be made mandatory by means of implementing legislation ensuring that wallets in all Member States are fully interoperable and observe the same standards.

---

### I have two nationalities and two identity cards/passports. Can I store them both in the same wallet?

For now the personal identification data provided by one Member State can only be used within the wallet provided by this Member State. But this does not matter as all national wallets will be completely interoperable and will be useable across the EU with the same functionalities.

---

### What will change for Europeans and EU businesses?

The main novelty offered by the new rules is that all EU citizens, residents and businesses will be offered EU Digital Identity Wallets which are accepted by private and public digital services in all Member States. You can find out more about the benefits of [EU Digital Identity Wallets](https://ec.europa.eu/sites/display/EUDIGITALIDENTITYWALLET/Benefits) here.

---

### My country already has an advanced e-identity system. Why should I use an EU Digital Identity Wallet?

The EU Digital Identity Wallets will not replace existing national eID schemes but supplement them as an option that (1) will be recognised across borders. (2) enables you to securely present and share a wide range of digital documents (like education diplomas, and train tickets) and (3) allows you to log in to a range of private sector services while preserving your privacy.

---

### What are Electronic Attestations of Attributes?

Electronic Attestations of Attributes, or EAAs, are referred to in the EU Digital Identity Framework Regulation. They are a type of **digital document** that can be added, stored and presented with the EU Digital Identity Wallet, and contain important information about ourselves. Examples include a university diploma, a boarding pass, or a driver’s license.

For the sake of simplicity, we refer to EAAs as digital documents throughout this website.

---

### What is the difference between digital assets and digital documents (or EAAs)?

What we refer to as digital documents throughout our website are also called Electronic Attestations of Attributes in the EU Digital Identity Framework Regulation. These are proofs of an attribute (about either a person or object). They are especially useful for important documents such as your driver’s licence, your diploma, or a travel document like a boarding pass, as these are usually needed to prove something and access services.

 

Digital assets on the other hand are digital objects, and can include everything from documents, to songs, to films. They also include Non-Fungible Tokens, or NFTs, which are a special kind of digital asset that represent ownership or the authenticity of something through a token.

 

The EU Digital Identity Wallet will store and present personal identification data and digital documents/Electronic Attestation of Attributes but not digital assets. You will be able to store your university diploma in your wallet, but not your favourite song.

---

### Will I be able to store NFTs on my wallet?

NFTs, or Non-Fungible Tokens, are unique digital identifiers used to certify ownership and authenticity. There are no plans or provisions in the regulation for the wallet to store digital assets or NFTs.

 

EU Digital Identity Wallets are personal digital wallets allowing citizens to digitally prove who they are, as well as store and manage identity data and official documents in digital form, ex. Driving licences, digital travel credentials, educational qualifications. These digital documents are also referred to as  Electronic Attestations of Attributes in the EU Digital Identity Framework Regulation.

 It is possible to create Qualified/Unqualified Electronic Attestation of Attributes that proves ownership of a specific object and issue it to an EU Digital Identity Wallet.

---


---

## Governance and Actors

### Will a unique European Digital Identity replace national digital identities?

No, replacing national digital identities is not the aim of the revised Regulation. Member States will continue to provide digital identities.

Instead, the European Digital Identity framework extends the functionalities and usability of national eIDs by means of a personal digital wallet. The obligation on Member States to offer EU Digital Identity Wallets will ensure that every person and business in the EU has access to a means of digital identification.

Every citizen will have the choice whether to use the European Digital Identity wallet or a national eID system.

---

### How will Member States participate in the new European Digital Identity Governance Framework?

The Regulation sets out a new comprehensive governance framework for both electronic identification and trust services to support the implementation and supervision of the European Digital Identity Framework.
The new governance framework notably includes a new cooperation and coordination body (European Digital Identity Cooperation Group) to advise the Commission in the preparation of implementing legislation, organise peer reviews, discuss requests for mutual assistance and exchange views, best practices and other information between all parties. In this way, the new set-up will improve the consistency and effectiveness of the current governance system.

---

### How is the Commission helping Member States prepare for the EU Digital Identity Wallet?

Under the [Digital Europe Programme](https://digital-strategy.ec.europa.eu/en/activities/digital-programme), the Commission is in the process of developing a wallet prototype based on the technical specifications. The software is already [published](https://github.com/eu-digital-identity-wallet/.github/blob/main/profile/reference-implementation.md) on Github for voluntary use by Member States. In addition, under the same [programme](https://digital-strategy.ec.europa.eu/en/activities/digital-programme), the Commission is co-funding [Large Scale Pilots](https://ec.europa.eu/digital-building-blocks/sites/display/EUDIGITALIDENTITYWALLET/What+are+the+Large+Scale+Pilot+Projects), which test the wallets in a diverse range of everyday use cases. Examples of use cases include providing identification to online and offline public and private services, displaying one's mobile driving licence, authorising payments, exchanging diplomas, signing documents electronically, and presenting medical prescriptions. The results of the pilots will make it easier and quicker for Member States to develop and offer the wallet to their citizens and will help avoid bugs.

---

### Who will provide the EU Digital Identity Wallet?

Member States have the choice to offer the wallets to their citizens and residents themselves, mandate another organisation with the provision, or recognise an independent provider. The offer may differ by Member State.

---

### What can I do with the new EU Digital Identity Wallets?

You will be able to use it to identify digitally for public and private online services across the EU wherever this is necessary. You will also be able to sign digital documents (such as an employment or rental contract). In addition you will be able to share digital documents about yourself, such as educational or professional certificates, or hold a digital driving licence or a digital visa (Digital Travel Credential) in your wallet.

You will be able to download, store and use basic personal data and digital documents or credentials in digital form very much like today in your physical wallet or briefcase.

---

### What are the standards and technical requirements for European Digital Wallets?

The European Commission and Member State experts are together working to create a common toolbox needed to develop the wallet, which includes the Architecture and Reference Framework ([Technical Specifications](https://ec.europa.eu/digital-building-blocks/sites/display/EUDIGITALIDENTITYWALLET/Technical+Specifications)). All guidelines will follow international standards already in use.

---

### Why will the European Digital Identity Wallets be developed under an open-source licence?

Transparency on the technical set-up of the European Digital Identity Wallets is important for public trust and for building a well functioning and fully secure system. Everybody can scrutinise the technological set-up proposed and provide feedback on the choices made. Security weaknesses, bugs or malfunctions can be better identified and corrected in this way. Member States may limit the disclosure of some parts of the source code for reasons of public security.

---


---

## Legal and Regulation

### How do you protect personal data  against the risk of profiling?

Existing online platforms are able to trace all of a user's activities. The EU Digital Identity Wallets will protect the privacy of the user who will retain full control over the data he/she shares. Providers of the wallet, including governments must not see any personal data or have insight into the transactions of the users of the European Digital Identity Wallet; except where this is necessary to ensure the functioning of the wallet, for instance to recover data in case mobile phones are lost or stolen.

---

### How can we be sure that the person operating the wallet is the same person whose Digital ID is in the wallet? For example, can a child operate the wallet on behalf of their elderly parent?

The wallet will assure through a variety of security features (e.g. PIN codes, biometrics) that it is usable only by the person to whom it has been issued. It will be illegal under national law to use the wallet of another person unless this person has given explicit consent.

---

### Is the EU Digital Identity Wallet hackable? Is our personal, health and tax information safe from bad actors?

Wallets must be compliant to the highest security standards available today to ensure that personal data is fully protected. All wallets will be thoroughly tested and independently certified to ensure that all security requirements are valid.

---

### Are there any technical data standards for digital documents and certificates to be included in the wallet?

Digital documents stored in the wallet will have to follow harmonised data standards to ensure they are machine - readable and can be automatically processed.

---

### How is a high standard of security for European Digital Identity Wallets ensured in all Member States?

All key features and requirements of the wallets will be implemented following common technical standards. This is one of the main innovations of the Digital Identity Regulation. It means that the wallet can be used in the same way in all Member States and offer users the same basic services and functionalities irrespective of which Member State issues it.

This will also ensure compliance with data protection features, such as a dashboard to allow the user to see the log of all interactions of the wallet, a possibility to download and transfer data and a possibility to directly lodge a complaint in case of data breaches. 

To ensure that security requirements are observed by all Member States, all wallets must be independently certified to the same security standards. The certification system will make use of harmonised standards and follow the EU Cybersecurity Act. Until this system is fully operational, wallets will be certified at national level. However, standards will be the same and  certification by national bodies will follow common standards established by implementing acts. In addition, all certification schemes will be submitted for opinion and recommendations to a joint board (European Digital Identity Cooperation Board) as an additional safeguard to ensure a harmonised approach and the highest degree of security.

---

### I don't want to use any wallet. Is the EU Digital Wallet mandatory for all EU citizens?

No, the use of the wallet is voluntary, there will be no mandatory issuance of wallets to EU citizens.

