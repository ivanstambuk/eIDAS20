> **Source:** EC Digital Building Blocks — eSignature FAQ
>
> **External URL:** https://ec.europa.eu/digital-building-blocks/sites/spaces/DIGITAL/pages/880312429/eSignature+FAQ
>
> **Last Updated:** 2026-01 (import date)
>
> **Category:** Guidance
>
> **Note:** This is a one-time import of the EC eSignature FAQ. Definitions are preserved verbatim per DEC-092.

# eSignature FAQ

Frequently asked questions about electronic signatures, electronic seals, and trust services under the eIDAS Regulation.

---

## General Questions

### What is an electronic signature?

An electronic signature is a data in electronic form which is attached to or logically associated with other data in electronic form and which is used by the signatory to sign, where the signatory is a natural person.

Like its handwritten counterpart in the offline world, an electronic signature can be used, for instance, to electronically indicate that the signatory has written the document, agreed with the content of the document, or that the signatory was present as a witness.

In case you want to seal a document as a legal person (e.g. as a business or organisation), you might be instead interested in an electronic seal.

---

### What is an electronic seal?

An electronic seal is a data in electronic form, which is attached to or logically associated with other data in electronic form to ensure the latter's origin and integrity, where the creator of a seal is a legal person (unlike the electronic signature that is issued by a natural person).

In this purpose, electronic seals might serve as evidence that an electronic document was issued by a legal person, ensuring certainty of the document's origin and integrity. Nevertheless, across the European Union, when a transaction requires a qualified electronic seal from a legal person, a qualified electronic signature from the authorised representative of the legal person is equally acceptable.

---

### What is the difference between an electronic signature and a digital signature?

An **'electronic signature'** is a legal concept that is defined in eIDAS by the following:

> "'electronic signature' means data in electronic form which is attached to or logically associated with other data in electronic form and which is used by the signatory to sign;" (eIDAS Article 3.10)

A **digital signature**, on the other hand, refers to a mathematical and cryptographic concept that is widely used to provide concrete and practical instances of electronic signature. The definition given by ETSI TR 119 100 is that of data appended to, or a cryptographic transformation of a data unit that allows a recipient of the data unit to prove the source and integrity of the data unit and protect against forgery e.g. by the recipient.

These two concepts should be distinguished, as **all electronic signatures are not necessarily digital signatures**.

---

### What are the levels (simple, advanced and qualified) of electronic signatures?

The eIDAS Regulation defines three levels of electronic signature: 'simple' electronic signature, advanced electronic signature and qualified electronic signature. The requirements of each level are built on the requirements of the level below it, such that a qualified electronic signature meets the most requirements and a 'simple' electronic signature the least.

#### 'Simple' electronic signatures

An electronic signature is defined as "data in electronic form which is attached to or logically associated with other data in electronic form and which is used by the signatory to sign". Thus, something as simple as writing your name under an e-mail might constitute an electronic signature.

#### Advanced electronic signatures (AdES)

An advanced electronic signature is an electronic signature which is additionally:

- uniquely linked to and capable of identifying the signatory;
- created in a way that allows the signatory to retain control;
- linked to the document in a way that any subsequent change of the data is detectable.

The most commonly used technology able to provide these requirements relies on the use of a public-key infrastructure (PKI), which involves the use of certificates and cryptographic keys.

#### Qualified electronic signatures (QES)

A qualified electronic signature is an advanced electronic signature which is additionally:

- created by a qualified signature creation device (QSCD);
- and is based on a qualified certificate for electronic signatures.

---

### What are the levels (simple, advanced and qualified) of electronic seals?

Like the electronic signature, the eIDAS Regulation defines three levels of electronic seal: 'simple' electronic seal, advanced electronic seal and qualified electronic seal. The requirements of each level are built on the requirements of the level below it, such that a qualified electronic seal meets the most requirements and a 'simple' electronic seal the least.

Nevertheless, levels of electronic seals don't have the same definitions, requirements, nor legal effects than levels of electronic signatures:

#### 'Simple' electronic seals

An electronic seal is defined as "data in electronic form, which is attached to or logically associated with other data in electronic form to ensure the latter's origin and integrity".

#### Advanced electronic seals (AdES)

An advanced electronic seal is an electronic seal which is additionally:

- uniquely linked to the creator of the seal;
- capable of identifying the creator of the seal;
- created using electronic seal creation data that the creator of the seal can, with a high level of confidence under its control, use for electronic seal creation; and
- linked to the data to which it relates in such a way that any subsequent change in the data is detectable.

The most commonly used technology able to provide these requirements relies on the use of a public-key infrastructure (PKI), which involves the use of certificates and cryptographic keys.

#### Qualified electronic seals (QES)

Similar to a qualified electronic signature, a qualified electronic seal is an advanced electronic seal which is additionally:

- created by a qualified seal creation device (QSCD);
- and is based on a qualified certificate for electronic seals.

---

### What is a certificate for electronic signatures?

When signing a document, a pair of keys might be needed (i.e. when the signature relies on the use of public-key infrastructure), namely a 'public key' and a 'private key'. The public key can be publicly shared while the private key shall be securely stored. Especially, the private key is used by the signatory to sign a document while the public key is used by anyone verifying that it is actually the private key of the signatory that has been used to sign the document.

A **certificate for electronic signatures**, issued by a Certificate Authority (CA), is an electronic attestation which links electronic signature validation data to a natural person and confirms at least the name or the pseudonym of that person. This way, the certificate, usually linked to the signed document, can be used to verify the identity of the signatory and whether the document has been signed using the corresponding private key.

**Qualified certificates** for electronic signatures, by following stricter requirements laid down in eIDAS, provide, for instance, higher guarantees regarding the identity of the signatory and therefore higher legal certainty regarding the created electronic signatures. Especially, qualified certificates are provided by qualified trust service providers (QTSP) which have been audited as such and granted a qualified status by a national competent authority, as reflected in the national [Trusted List](https://ec.europa.eu/digital-single-market/en/eu-trusted-lists-trust-service-providers).

Those lists, and therefore QTSPs listed in it, can be browsed in a user-friendly way using the [Trusted List Browser](https://eidas.ec.europa.eu/efda/trust-services/browse/eidas/tls).

Usually, providers of qualified certificates for electronic signatures deliver the corresponding private key on a qualified signature creation device (QSCD).

---

### What is a certificate for electronic seals?

When sealing a document, a pair of keys might be needed (i.e. when the seal relies on the use of public-key infrastructure), namely a 'public key' and a 'private key'. The public key can be publicly shared while the private key shall be securely stored. Especially, the private key is used by the creator of the seal to seal a document while the public key is used by anyone verifying that it is actually the private key of the creator of the seal that has been used to seal the document.

A **certificate for electronic seals**, issued by a Certificate Authority (CA), is an electronic attestation that links electronic seal validation data to a legal person and confirms the name of that person. This way, the certificate, usually linked to the sealed document, can be used to verify the identity of the creator of the seal and whether the document has been sealed using the corresponding private key.

Like qualified certificates for electronic signatures, **qualified certificates for electronic seals**, by following stricter requirements laid down in eIDAS, provide, for instance, higher guarantees regarding the identity of the creator of the seal and therefore higher legal certainty regarding the created electronic seals. Especially, qualified certificates are provided by qualified trust service providers (QTSP) which have been audited as such and granted a qualified status by a national competent authority, as reflected in the national [Trusted List](https://ec.europa.eu/digital-single-market/en/eu-trusted-lists-trust-service-providers).

Those lists, and therefore QTSPs listed in it, can be browsed in a user-friendly way using the [Trusted List Browser](https://eidas.ec.europa.eu/efda/trust-services/browse/eidas/tls).

Usually, providers of qualified certificates for electronic seals deliver the corresponding private key on a qualified seal creation device (QSCD).

---

### What is a qualified signature/seal creation device (QSCD)?

Signature/seal creation devices come in many forms to protect the electronic signature/seal creation data (e.g. private key) of the signatory/creator of the seal, such as smartcards, SIM cards, USB sticks.

A **qualified signature/seal creation device (QSCD)**, by following stricter requirements laid down in eIDAS, offers higher guarantees regarding the protection (e.g. mitigating any kind of replication or forgery) of the electronic signature/seal creation data (such as the private key) and therefore higher legal certainty regarding the created qualified electronic signatures/seals.

For example, a smartcard (e.g. ID card), when following specific requirements, can be seen as a QSCD as, in order to "unlock" the electronic signature creation data, the signatory shall physically possess the smartcard and know the associated PIN code.

A QSCD is not necessarily in the physical possession of the signatory/creator of the seal but can also be **remotely managed** by a qualified trust service provider (QTSP). This kind of QSCD is known as "remote QSCD". Those remote QSCD offer an improved user experience while maintaining the legal certainty offered by qualified electronic signatures/seals.

---

### What are the legal effects of an electronic signature?

Across all EU Member States, the legal effects of electronic signatures are laid down in **Article 25 of eIDAS**.

An electronic signature (either simple, advanced or qualified) shall not be denied legal effect and admissibility as evidence in legal proceedings solely on the grounds that it is in an electronic form or that it does not meet the requirements for qualified electronic signatures.

Regarding **qualified electronic signatures**, they explicitly have the **equivalent legal effect of handwritten signatures** across all EU Member States.

---

### What are the legal effects of an electronic seal?

Across all EU Member States, the legal effects of electronic seals are laid down in **Article 35 of eIDAS**.

Like an electronic signature, an electronic seal shall not be denied legal effect and admissibility as evidence in legal proceedings solely on the grounds that it is in an electronic form or that it does not meet the requirements for qualified electronic seals.

Regarding **qualified electronic seals**, they explicitly enjoy the **presumption of integrity of the data and of correctness of the origin** of that data to which the qualified electronic seal is linked across all EU Member States.

---

### Do I need a qualified electronic signature?

While different levels of electronic signatures may be appropriate in different contexts, only **qualified electronic signatures are explicitly recognized to have the equivalent legal effect of hand-written signatures** all over EU Member States.

Moreover, as a general rule, if a certain level of electronic signature (e.g. advanced signature) is required, a higher level will probably be accepted (e.g. advanced signature with a qualified certificate, qualified electronic signature).

---

### Do I need a qualified electronic seal?

While different levels of electronic seals may be appropriate in different contexts, only **qualified electronic seals explicitly enjoy the presumption of integrity of the data and of correctness of the origin** of that data to which the qualified electronic seal is linked, all over EU Member States.

Moreover, as a general rule, if a certain level of electronic seal (e.g. advanced seal) is required, a higher level will probably be accepted (e.g. advanced signature with a qualified seal, qualified electronic seal).

Nevertheless, when a transaction requires a qualified electronic seal from a legal person, a qualified electronic signature from the authorised representative of the legal person is equally acceptable.

---

### How can I create an advanced or qualified electronic signature?

In the first place, in order to sign documents as a natural person (in order to seal documents as a legal person, you might be instead interested in electronic seals), a certificate for electronic signatures is needed. And, using this certificate, electronic signatures can be created. As part of the eIDAS Regulation, these certificates can be purchased from specific providers, named Trust Service Providers (TSP).

**1. Obtain a digital certificate from a TSP**

In the case of an 'advanced electronic signature', the certificate can be or not qualified. In the case of a 'qualified electronic signature', the certificate shall be qualified and the private key related to the certificate shall be stored on a 'qualified electronic signature creation device' (QSCD).

As a general rule, if a certain level of electronic signature (e.g. advanced signature) is required, a higher level will probably be accepted (e.g. advanced signature with a qualified certificate, qualified electronic signature).

As laid down in eIDAS, a qualified electronic signature explicitly has the equivalent legal effect of a handwritten signature.

Providers of qualified certificates for electronic signatures, as an eIDAS legal obligation, are mandatorily listed in the corresponding national [Trusted List](https://ec.europa.eu/digital-single-market/en/eu-trusted-lists-trust-service-providers). But providers of non-qualified certificates for electronic signatures could be but are not mandatorily listed in these Trusted Lists.

**2. Choose your TSP using Trusted List Browser**

Using [Trusted List Browser](https://eidas.ec.europa.eu/efda/tl-browser/#/screen/home), go to "[Search by Type of service](https://eidas.ec.europa.eu/efda/tl-browser/#/screen/search/type/1)" (top left of the screen).

Select "Certificate for electronic signature" and/or "Qualified certificate for electronic signature" and click "Next".

Then, select any country you may found appropriate and click "Search".

Finally, click on any TSP you may found appropriate and, via the "Electronic address" multi-part field of the "Detailed information", you will find a link to a website providing more information about this provider and the products it provides.

**3. Sign your document**

Once you have a certificate for electronic signature, you will be able to sign documents. TSPs might offer their own step-by-step process for signing digitally.

The European Commission also proposes a [demo of DSS](https://ec.europa.eu/digital-building-blocks/DSS/webapp-demo/sign-a-document), a tool enabling, among other features, the signature of documents. This demo is based on the open-source library Digital Signature Software (DSS). DSS supports the creation and verification of interoperable and secure electronic signatures in line with the eIDAS Regulation. More information is available in the [DSS documentation](https://ec.europa.eu/digital-building-blocks/sites/display/DIGITAL/Digital+Signature+Service+-++DSS#DigitalSignatureServiceDSS-Documentation).

---

### How can I create an advanced or qualified electronic seal?

In the first place, in order to seal documents as a legal person, a certificate for electronic seals is actually needed. And, using this certificate, electronic seals can be created. As part of the eIDAS Regulation, these certificates can be purchased from specific providers, named Trust Service Providers (TSP).

**1. Obtain a digital certificate from a TSP**

In the case of an 'advanced electronic seal', the certificate can be or not qualified. In the case of a 'qualified electronic seal', the certificate shall be qualified and the private key related to the certificate shall be stored on a 'qualified electronic seal creation device' (QSCD).

As a general rule, if a certain level of electronic seal (e.g. advanced seal) is required, a higher level will probably be accepted (e.g. advanced seal with a qualified certificate, qualified electronic seal).

As laid down in eIDAS, a qualified electronic seal explicitly enjoys the presumption of integrity of the data and of correctness of the origin of that data to which the qualified electronic seal is linked.

Providers of qualified certificates for electronic seals, as an eIDAS legal obligation, are mandatorily listed in the corresponding national [Trusted List](https://ec.europa.eu/digital-single-market/en/eu-trusted-lists-trust-service-providers). But providers of non-qualified certificates for electronic seals could be but are not mandatorily listed in these Trusted Lists.

**2. Choose your TSP using Trusted List Browser**

Using [Trusted List Browser](https://eidas.ec.europa.eu/efda/tl-browser/#/screen/home), go to "[Search by Type of service](https://eidas.ec.europa.eu/efda/tl-browser/#/screen/search/type/1)" (top left of the screen).

Select "Certificate for electronic seal" and/or "Qualified certificate for electronic seal" and click "Next".

Then, select any country you may found appropriate and click "Search".

Finally, click on any TSP you may found appropriate and, via the "Electronic address" multi-part field of the "Detailed information", you will find a link to a website providing more information about this provider and the products it provides.

**3. Seal your document**

Once you have a certificate for electronic seal, you will be able to seal documents. TSPs might offer their own step-by-step process for sealing digitally.

The European Commission also proposes a [demo of DSS](https://ec.europa.eu/digital-building-blocks/DSS/webapp-demo/sign-a-document), a tool enabling, among other features, the signature and seal of documents. This demo is based on the open-source library Digital Signature Software (DSS). DSS supports the creation and verification of interoperable and secure electronic signatures/seals in line with the eIDAS Regulation. More information is available in the [DSS documentation](https://ec.europa.eu/digital-building-blocks/sites/display/DIGITAL/Digital+Signature+Service+-++DSS#DigitalSignatureServiceDSS-Documentation).

---

### When signing/sealing a document, which format of signature should I use?

Three formats of advanced signature and one format of signature container are specified in the European Telecommunications Standards Institute (ETSI) standards, namely:

- **XML advanced electronic signature (XAdES)**, based on XML signatures;
- **PDF advanced electronic signature (PAdES)**, based on PDF signatures;
- **CMS advanced electronic signature (CAdES)**, based on Cryptographic Message Syntax (CMS);
- **Associated Signature Container (ASiC)** based on ZIP format and supporting XAdES and CAdES signature formats.

Especially, following [CID 2015/1506](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ%3AJOL_2015_235_R_0006), these formats shall be recognised by European public sector bodies.

Advanced electronic signatures and advanced electronic seals being similar from the technical point of view, the standards for formats of advanced electronic signatures apply *mutatis mutandis* to formats for advanced electronic seals.

**When signing/sealing a single document**, the format of signature to choose typically depends on the format of the document to sign:

- **XML documents** are suggested to be signed/sealed using XAdES signature format (either with enveloped or enveloping packaging);
- **PDF documents** are suggested to be signed/sealed using PAdES signature format;
- **Binary files** are suggested to be signed/sealed with XAdES or CAdES signature formats (with enveloping packaging).

**When signing/sealing multiple documents**, it is suggested to use ASiC containers.

Above suggestions are intended for basic usage of the signature/seal of documents. Other formats of signatures might be more appropriate in other specific contexts.

---

### What is an electronic time stamp, and do I need one?

An **electronic time stamp** is a data in electronic form which binds other data in electronic form to a particular time establishing evidence that the latter data existed at that time.

For example, a signatory can use an electronic time stamp to bind a signed document to a particular date and time and prove in the future that the signed document existed at this particular date and time.

As part of eIDAS, a time stamp can be qualified. Following stricter requirements laid down in eIDAS, a **qualified electronic time stamp** enjoys the presumption of the accuracy of the date and the time it indicates and the integrity of the data (e.g. signed document) to which the date and time are bound.

---

### What are the legal effects of an electronic time stamp?

Across all EU Member States, the legal effects of electronic time stamps are laid down in **Article 41 of eIDAS**.

An electronic time stamp (qualified or not) shall not be denied legal effect and admissibility as evidence in legal proceedings solely on the grounds that it is in an electronic form or that it does not meet the requirements of the qualified electronic time stamp.

Regarding **qualified electronic time stamps**, they enjoy the presumption of the accuracy of the date and the time it indicates and the integrity of the data to which the date and time are bound, across all EU Member States.

---

### How can I get a qualified electronic time stamp?

Qualified time stamps are provided as part of a service, provided by qualified trust service providers (QTSP). QTSP, as an eIDAS legal obligation, are mandatorily listed in the corresponding national [Trusted List](https://ec.europa.eu/digital-single-market/en/eu-trusted-lists-trust-service-providers).

Trusted Lists, and therefore the providers listed in it, can be browsed in a user-friendly way using the [Trusted List Browser](https://eidas.ec.europa.eu/efda/tl-browser/#/screen/home).

Using Trusted List Browser, go to "[Search by Type of service](https://eidas.ec.europa.eu/efda/tl-browser/#/screen/search/type/1)" (top left of the screen):

1. Select "Qualified time stamp" and click "Next".
2. Then, select any country you may found appropriate and click "Search".
3. Finally, click on any QTSP you may found appropriate and, via the "Electronic address" multi-part field of the "Detailed information", you will find a link to a website providing more information about this provider and the products it provides.

---

### What is the validation of a qualified electronic signature?

When a party needs to rely on signed electronic data (e.g. a signed document), it is very often important that it can verify:

- The integrity of the signed data;
- The authenticity of the signed data.

The requirements for the validation of qualified electronic signatures are, in particular, described in **Article 32 of the eIDAS Regulation**. In this context:

- **Integrity** means that no modification has been made to the signed data after it has been signed;
- **Authenticity** means that the signature is supported by a qualified certificate identifying the signatory, and that only the signatory can produce the signature.

A summary and non-exhaustive overview of the steps involved in the validation process for qualified electronic signature would be:

- The verification of the integrity of the data;
- The verification of the validity of the certificate;
- The verification of the qualified status of the certificate; and
- The verification of the signature was created by a qualified electronic signature creation device.

Finally, as numerous steps are involved in this validation process, the answer to a validation request can take the form of a **validation report** that contains the set of answers to the various verifications and steps involved during the validation process.

---

### How do I validate an electronic signature/seal as qualified?

#### Using DSS Demonstration WebApp

In order to easily validate on any format of document whether a signature/seal is qualified, you might be interested in the "Validate a signature" feature of [DSS Demonstration WebApp](https://ec.europa.eu/digital-building-blocks/DSS/webapp-demo/validation). This demo is based on the open-source library Digital Signature Software (DSS). DSS supports the creation and verification of interoperable and secure electronic signatures/seals in line with the eIDAS Regulation. More information is available in the [DSS documentation](https://ec.europa.eu/digital-building-blocks/sites/display/DIGITAL/Digital+Signature+Service+-++DSS#DigitalSignatureServiceDSS-Documentation).

#### Using Adobe Acrobat Reader (for signatures only)

When the signed document is a PDF, you can also use the "Adobe Acrobat Reader" software. If, via the Signature Panel, the software indicates "This is a Qualified Electronic Signature according to EU Regulation 910/2014", you can assume the signature is qualified.

#### Via a qualified trust service

Some qualified trust service providers (QTSP) also offer "qualified validation service for qualified electronic signature/seal" services. When using this kind of service, users ensure the validation service follows requirements laid down in eIDAS and benefit therefore of higher legal certainty.

QTSP, as an eIDAS legal obligation, are mandatorily listed in the corresponding national [Trusted List](https://ec.europa.eu/digital-single-market/en/eu-trusted-lists-trust-service-providers). Trusted Lists, and therefore the providers listed in it, can be browsed in a user-friendly way using the [Trusted List Browser](https://eidas.ec.europa.eu/efda/tl-browser/#/screen/home).

Using Trusted List Browser, go to "[Search by Type of service](https://eidas.ec.europa.eu/efda/tl-browser/#/screen/search/type/1)" (top left of the screen):

1. Select "Qualified validation service for qualified electronic signature" or "Qualified validation service for qualified electronic seal" and click "Next".
2. Then, select any country you may found appropriate and click "Search".
3. Finally, click on any QTSP you may found appropriate and, via the "Electronic address" multi-part field of the "Detailed information", you will find a link to a website.

---

### When validating a qualified certificate, what is the related Trust Anchor?

As defined by RFC 5280, a **Trust Anchor** is the end point of a certificate validation process.

As part of the EU [Trusted List](https://ec.europa.eu/digital-single-market/en/eu-trusted-lists-trust-service-providers), when validating a qualified certificate (i.e. QC for electronic signatures, QC for electronic seals, QC for website authentication), the Trust Anchor is the Service digital identity (Sdi) of a trust service entry (cf. ETSI TS 119 612 v2.1.1). It means that, when validating a certificate, there is no need to chain up to the Root CA of a qualified certificate but only to the related CA/QC issuer entry within the Trusted List.

In order to extract the certificate chain from a qualified certificate to its issuer, you may find interesting the "certificate validation" feature of [DSS Demonstration WebApp](https://ec.europa.eu/digital-building-blocks/DSS/webapp-demo/validation). This demo is based on the open-source library Digital Signature Software (DSS). DSS supports the creation and verification of interoperable and secure electronic signatures in line with the eIDAS Regulation. More information is available in the [DSS documentation](https://ec.europa.eu/digital-building-blocks/sites/display/DIGITAL/Digital+Signature+Service+-++DSS#DigitalSignatureServiceDSS-Documentation).

You will also find more document information about this certificate validation in the "Introduction to the Qualified electronic signature (QES) validation algorithm" [webpage](https://ec.europa.eu/digital-building-blocks/sites/x/H4XXGw).

---

## Glossary

### What does AdES mean?

AdES is the acronym for either an **advanced electronic signature** or an **advanced electronic seal**. It is the second level of electronic signatures/seals defined in eIDAS.

---

### What does QES mean?

QES is the acronym for either **qualified electronic signature** or **qualified electronic seal**. It is the third and most secure level of electronic signature/seal defined in eIDAS.

---

### What does (Q)TSP/(Q)TS mean?

A **trust service provider (TSP)** is a natural or a legal person who provides one or more trust services (TS) either as a qualified or as a non-qualified trust service provider.

A **qualified trust service provider (QTSP)** is a TSP who provides one or more qualified trust services (QTS) and is granted the qualified status by the national supervisory body. The decision of the supervisory body to grant the qualified status is reflected in the corresponding national [Trusted List](https://ec.europa.eu/digital-single-market/en/eu-trusted-lists-trust-service-providers). In this respect, QTSPs are mandatorily listed in the corresponding national Trusted List while TSP could be but are not mandatorily listed in these Trusted Lists.

Trusted Lists, and therefore the providers listed in it, can be browsed in a user-friendly way using the [Trusted List Browser](https://eidas.ec.europa.eu/efda/tl-browser/#/screen/home).

---

### What does QC mean?

QC stands for a **qualified certificate**. As part of eIDAS, a qualified certificate can either be a:

- Qualified certificate for electronic signature
- Qualified certificate for electronic seal
- Qualified certificate for website authentication

---

### What does QSCD mean?

QSCD stands for a **qualified electronic signature/seal creation device**.

---

### What does AdES/QC mean?

AdES/QC is an **advanced electronic signature/seal (AdES) based on a qualified certificate**.

---

## Trusted List Browser

### What is the Trusted List Browser?

[Trusted List Browser](https://eidas.ec.europa.eu/efda/tl-browser/#/screen/home) is a publicly available tool provided by the European Commission. It allows the user to browse through the information present in the Member States national Trusted Lists (TLs), as well as in the European Commission central list (named List of Trusted Lists (LOTL)). It provides an intuitive interface that is user-friendly and human-readable.

Trusted List Browser should be taken as a tool to search for Trust Service Providers and the services associated with them that are listed in a Member State national Trusted List. It is not intended to provide sufficient information to be used in a validation process.

---

### What is a Trusted List?

The eIDAS Regulation introduces the concept of **Trusted List (TL)** in the following statement:

> "Each Member State shall establish, maintain and publish trusted lists, including information related to the qualified trust service providers for which it is responsible, together with information related to the qualified trust services provided by them." (eIDAS article 22.1).

It may therefore be understood that all qualified trust services (QTSP's) and the qualified trust services (QTS) they provide are mandatorily listed in its national TL, and that this is the main goal the TL's serve. Nevertheless, while not mandatory in eIDAS, Member States can also include in their TL's information related to non-QTSP and non-QTS.

The information related to the trust services includes information about the status (e.g. granted, withdrawn) and the status history of the trust services in compliance with the applicable requirements and the relevant provisions of the eIDAS Regulation.

In addition to the legal definition provided by eIDAS, the [Commission Implementing Decision (EU) 2015/1505](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX%3A32015D1505) specifies the technical specifications and formats for Trusted List.

---

### What is the List of Member States Trusted Lists, also named List of Trusted Lists (LOTL)?

The eIDAS Regulation states that:

> "The Commission shall make available to the public, through a secure channel, the information referred to in paragraph 3 [i.e. about Member States Trusted Lists] in electronically signed or sealed form suitable for automated processing." (eIDAS article 22.4)

In practice, the European Commission publishes an XML document called the **List of Trusted Lists (LOTL)**, which consists of a compiled list of links (pointers) towards all trusted lists from the Member States, together with the certificates used to sign these trusted lists.

The primary goals of the publication of the LOTL are to allow access to the trusted lists of all Member States in an easy way and to provide a way to trust and authenticate those lists.

More information on the LOTL can be found [here](https://eidas.ec.europa.eu/efda/tl-browser/#/screen/home).

---

### Which trust service providers can I find using Trusted List Browser?

Using the Trusted List Browser allows you to find any Trust Service Provider (TSP) listed in a Member State national Trusted List. This means that you should be able to find any Qualified Trust Service Providers (QTSP's) and the qualified trust services it provides, as it is mandatory for them to be listed in an EU MS national TL.

Any other TSP (i.e. non-qualified TSP) may or may not be found using Trusted List Browser, as they are not required to be listed in a national TL.

Please keep mind that **finding a TSP using Trusted List Browser does not mean that it is a Qualified TSP**. In order to verify that a TSP corresponds to your needs, you can refer to the tags associated to it.

---

### What is a qualified trust service?

The eIDAS Regulation aims to deliver a comprehensive cross-border and cross-sector framework for secure, trustworthy and easy-to-use electronic transactions. Qualified trust services are a mean to this end, as their legal significance is recognised at European level. They are subject to strict requirements that consist of:

**a) Issuing qualified certificates for:**
- Electronic signature
- Electronic seal
- Website authentication

**b) Providing qualified validation of:**
- Qualified electronic signature
- Qualified electronic seal

**c) Providing qualified preservation of:**
- Qualified electronic signature
- Qualified electronic seal

**d) Issuing qualified time stamp**

**e) Providing qualified electronic registered delivery**

---

### What is the difference between non-qualified and qualified trust service providers?

The eIDAS Regulation defines a qualified trust service provider (QTSP) as "[…] a natural or a legal person who provides one or more qualified trust services […]".

As opposed to non-qualified trust service providers, QTSP's are thus granted the right to deliver one or more qualified trust services after undergoing a strict assessment process.

While it is mandatory for QTSP to be listed in an EU Member State Trusted List (TL), member states may decide to include non-qualified trust service providers in their TL.

Trusted List Browser allows the user to search for QTSP by the type of qualified trust services they provide, as well as easily identifying which trust services, qualified or not, are provided by a particular TSP listed on a national TL, using explicit tags.

---

### Why is a qualified trust service provider tagged with non-qualified trust services?

A qualified trust service provider (QTSP) must provide at least one qualified trust service, but may also provide non-qualified trust services. That is the reason why some QTSP may be tagged with qualified and non-qualified trust services in the Trusted List Browser.

---

### What are the tags "granted" and "withdrawn"?

These two tags only concern qualified trust services. The right for a Qualified Trust Service Provider (QTSP) to provide a qualified trust service (QTS) is decided by the national Supervisory Body (SB). The decision of the SB to allow the QTSP to provide the QTS is reflected in the associated national Trusted List (TL). This is a field that Trusted List Browser visually represents as a tag under the QTS.

- If the tag under the qualified trust service states **"Granted"**, this means that the QTSP has been granted by the SB the right to currently provide the QTS.
- If the tag under the qualified trust service is **"Withdrawn"**, this means that the QTSP was, at one time, given the right to provide this qualified trust service, but this right has been currently withdrawn.

The history of this status can be found in Trusted List Browser under the banner "History", accessible by clicking on a qualified trust service.

---

### What are the tags "Non-Regulatory" and "Undefined"?

These two tags only concern non-qualified trust services and have to do with a refinement of their type:

- The tag **"Undefined"** is associated with trust services whose type has been defined in the eIDAS Regulation, but for which there is a lack of additional information in the TL to further specify its use.
- The tag **"Non-Regulatory"** on the other hand is associated with trust services whose type has not been defined in the eIDAS Regulation and are country-specific.

---

### What are the tags "Recognised at national level" and "Deprecated at national level"?

These two tags only concern non-qualified trust services and have to do with a refinement of their type:

- The tag **"Recognised at national level"** means that the trust service to which it refers as well as the relevant TSP have been granted an "approved" status, as recognized at national level.
- The tag **"Deprecated at national level"** means that the trust service to which it refers as well as the relevant TSP had their "approved" status withdrawn.

---

### I can't find a trust service provider in your Trusted List Browser, why so?

According to the eIDAS Regulation, only the Qualified Trust Service Providers (QTSP's) have to be listed in a Trusted List:

> "Each Member State shall establish, maintain and publish trusted lists, including information related to the qualified trust service providers for which it is responsible, together with information related to the qualified trust services provided by them." (eIDAS article 22.1)

As such, each national Trusted List may or may not include non-qualified TSPs. It is up to the Member State's Supervisory Body to decide which non-qualified TSP will be listed.
