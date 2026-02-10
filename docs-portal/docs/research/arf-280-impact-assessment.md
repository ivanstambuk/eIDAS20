# ARF v2.7.3 → v2.8.0 HLR diff report

| Metric | Count |
|--------|-------|
| HLRs in v2.7.3 | 616 |
| HLRs in v2.8.0 | 648 |
| **Added** | **43** |
| **Removed** | **11** |
| **Text changed** | **247** |
| Notes changed | 122 |

## Added HLRs (43)

### Topic 7: Attestation revocation and revocation checking (+2 HLRs)

- **AS-AP-07-025** (`VCR_18`): When using an Attestation Status List for revocation, the PID Provider, Attestation Provider, or Wallet Provider SHALL represent a sufficiently large number of PIDs, attestations, or WUAs on each Attestation Status List to ensure herd privacy.
  - *Note:* In this context, herd privacy means that if an entity requests a particular status list, the PID Provider, Attestation Provider, or Wallet Provider is not able to deduce which PID, attestation or WUA 
- **AS-AP-07-026** (`VCR_19`): A Wallet Unit SHOULD regularly check the revocation status of its PIDs, attestations, and WUAs, and notify the User if a PID, attestation, or WUA (i.e, the Wallet Unit itself), is revoked.

### Topic 9: Wallet Unit Attestation (+6 HLRs)

- **AS-WP-09-026** (`WUA_20a`): A PID Provider or Attestation Provider SHALL comply with all relevant requirements specified in [Technical Specification 3](../../technical-specifications/ts3-wallet-unit-attestation.md).
- **AS-WP-09-027** (`WUA_21`): Empty
- **AS-WP-09-028** (`WUA_22`): A Wallet Provider SHALL ensure that a non-revoked Wallet Unit at all times presents a temporally valid and non-revoked WIA to a PID Provider or Attestation Provider during the issuance process of a PID or attestation.
  - *Note:* This requirement applies to both device-bound and non-device-bound attestations.
- **AS-WP-09-029** (`WUA_23`): When issuing, presenting, or verifying a WIA, Wallet Providers, Wallet Units, PID Providers, and Attestation Providers SHALL only use cryptographic algorithms included in the [ECCG Agreed Cryptographic Mechanisms v2.0](https://certification.enisa.eur
- **AS-WP-09-030** (`WUA_24`): A Wallet Unit SHALL present a WIA only to a PID Provider or Attestation Provider, as part of the issuance process of a PID or an attestation, and not to a Relying Party or any other entity.
- **AS-WP-09-031** (`WUA_25`): During issuance of a PID or attestation, the PID Provider or Attestation Provider SHALL verify the WIA in accordance with the requirements in OpenID4VCI Appendix E.
  - *Note:* This requirement applies to both device-bound and non-device-bound attestations.

### Topic 10: Issuing a PID or attestation to a Wallet Unit (+10 HLRs)

- **AS-AP-10-090** (`ISSU_64`): PID Providers, Attestation Providers, and Wallet Units SHALL support the features of [OpenID4VCI] enabling the batch issuance of PIDs or attestations.
- **AS-AP-10-091** (`ISSU_65`): A PID Provider or an Attestation Provider of device-bound attestations SHALL verify that a re-issued PID or device-bound attestation is issued to the same Wallet Unit as the existing PID or attestation. 
  - *Note:* A PID Provider or Attestation Provider can do so by issuing a refresh token to the Wallet Instance during the original issuance of the PID or attestation, and requiring that the Wallet Instance uses i
- **AS-AP-10-092** (`ISSU_66`): Empty
- **AS-AP-10-093** (`ISSU_67`): A PID Provider SHALL have a policy governing all aspects of PID issuance and management. The policy SHALL comply with at least the extended normalised certificate policy (‘NCP+’) requirements as specified in ETSI EN 319 411-1, insofar applicable for 
  - *Note:* A common dedicated policy for issuing PIDs may be developed in the future. If so, this requirement will be changed to refer to it.
- **AS-AP-10-094** (`ISSU_68`): PID Providers SHALL ensure that the certificates they use for signing PIDs comply with all applicable requirements in ETSI TS 119 412-6, in particular Clause 4.
- **AS-AP-10-095** (`ISSU_69`): A QEAA Provider SHALL have a policy governing all aspects of QEAA issuance and management. The policy SHALL comply with at least the policy for qualified certificates issued to a natural person where the private key and the related certificate reside
  - *Note:* A common dedicated policy for issuing QEAAs may be developed in the future. If so, this requirement will be changed to refer to it.
- **AS-AP-10-096** (`ISSU_70`): QEAA Providers SHALL ensure that the certificates they use for signing QEAAs comply with all applicable requirements in ETSI TS 119 412-6, in particular Clause 7.
- **AS-AP-10-097** (`ISSU_71`): Providers of non-qualified EAAs SHALL ensure that the certificates they use for signing EAAs comply with all applicable requirements in ETSI TS 119 412-6, in particular Clause 6.
- **AS-AP-10-098** (`ISSU_72`): A PuB-EAA Provider SHALL have a policy governing all aspects of PuB-EAA issuance and management. The policy SHALL comply with at least the extended normalised certificate policy (‘NCP+’) requirements as specified in ETSI EN 319 411-1, insofar applica
  - *Note:* A common dedicated policy for issuing PuB-EAAs may be developed in the future. If so, this requirement will be changed to refer to it
- **AS-AP-10-099** (`ISSU_73`): PuB-EAAs Providers SHALL ensure that the certificates they use for signing PuB-EAAs comply with all applicable requirements in ETSI TS 119 412-6, in particular Clause 8.

### Topic 11: Pseudonyms (+9 HLRs)

- **AS-WP-11-024** (`PA_23`): A protocol enabling scope rate-limited pseudonyms SHALL rely solely on algorithms included in the [ECCG Agreed Cryptographic Mechanisms v2.0](https://certification.enisa.europa.eu/document/download/a845662b-aee0-484e-9191-890c4cfa7aaa_en?filename=ECC
- **AS-WP-11-025** (`PA_24`): A protocol enabling scope rate-limited pseudonyms SHALL enable a Wallet Unit to allow a User to generate a scope rate-limited pseudonym, register this by a Relying Party, and prove that this is within the rate and scope restrictions determined by the
- **AS-WP-11-026** (`PA_25`): A protocol enabling scope rate-limited pseudonyms SHALL allow a Relying Party, when a User presents a scope rate-limited pseudonym, to verify that the rate is not exceeded for this User.
- **AS-WP-11-027** (`PA_26`): A protocol enabling scope rate-limited pseudonyms SHALL allow a Relying Party to choose the scope and rate when requesting a scope rate-limited pseudonym from a User.
- **AS-WP-11-028** (`PA_27`): A protocol enabling scope rate-limited pseudonyms SHALL NOT allow any entity or collusion of entities not including the User, to link scope rate-limited pseudonyms of the same User when used across several different Relying Parties. This SHALL hold e
- **AS-WP-11-029** (`PA_28`): A protocol enabling scope rate-limited pseudonyms SHALL ensure that if the rate is larger than 1, a User's different pseudonyms SHALL be unlinkable for the same scope. This SHALL hold against any entity or collusion of entities, not including the Use
- **AS-WP-11-030** (`PA_29`): A protocol enabling scope rate-limited pseudonyms SHALL ensure that no entity or collusion of entities, not including a User, is able to authenticate or register with a scope rate-limited pseudonym of this User.
- **AS-WP-11-031** (`PA_30`): A Wallet Unit SHALL store cryptographic material necessary for authenticating as a scope rate-limited pseudonyms in either a WSCA/WSCD or in a keystore.
- **AS-WP-11-032** (`PA_31`): A User's scope rate limited pseudonyms for a particular scope and rate SHALL be persistent over time even if they start using another Wallet Unit.

### Topic 19: User navigation requirements (Dashboard logs for transparency) (+1 HLRs)

- **AS-WP-19-024** (`DASH_12`): The User interface referred to in DASH_08 SHALL enable the User, for each presentation transaction in the log, to easily request the Relying Party to delete any or all attributes presented to it in that transaction, or to send a report about that par

### Topic 20: Strong User authentication for electronic payments (+2 HLRs)

- **AS-WP-20-007** (`SUA_06`): The Wallet Unit SHALL render or adapt the dialogue message(s) displayed to the User (like font size and colour, background colour, text position, labels in the buttons to 'approve' or 'reject' a transaction), according to requirements in [TS12](https
- **AS-WP-20-008** (`SUA_07`): Upon receiving a presentation request with transactional data, the Wallet Unit SHALL validate if the transactional data is intended for the given attestation and that the transactional data conforms to the related technical specification and/or Attes

### Topic 27: Registration of PID Providers, Providers of QEAAs, PuB-EAAs, and non-qualified EAAs, and Relying Parties (+1 HLRs)

- **AS-MS-27-040** (`Reg_33`): Empty

### Topic 38: Wallet Unit revocation (+8 HLRs)

- **AS-WP-38-018** (`WURevocation_18`): A PID Provider issuing revocable PIDs SHALL, for each of its valid PIDs, regularly verify whether the Wallet Provider revoked the Wallet Unit on which that PID is residing, using the revocation information in the WUA it received during issuance of th
  - *Note:* a) This is a consequence of the legal requirement in [CIR 2024/2977], Article 5, 4.(b). b) See [Technical Specification 3](../../technical-specifications/ts3-wallet-unit-attestation.md) for how the PI
- **AS-WP-38-019** (`WURevocation_19`): An Attestation Provider issuing revocable attestations MAY decide to revoke an attestation if the Wallet Provider revoked the Wallet Unit on which that attestation is residing, in the same manner as described in WURevocation_18. An Attestation Provid
  - *Note:* Publishing its policy regarding revocation allows a Relying Party to decide if it can put sufficient trust in the attestations issued by that Attestation Provider.
- **EW-DM-38-012** (`WURevocation_11`): A Wallet Provider SHALL revoke a Wallet Unit upon the explicit request of a PID Provider, in case the natural person using the Wallet Unit has died. To do so, the Wallet Provider SHALL revoke all valid WUA(s) for that Wallet Unit. To identify the Wal
  - *Note:* See the notes to WUA_08.
- **EW-DM-38-013** (`WURevocation_12`): Before revoking a Wallet Unit per WURevocation_11, the Wallet Provider SHALL verify that the party requesting revocation is indeed a valid PID Provider listed in the LoTE of PID Providers.
- **EW-DM-38-014** (`WURevocation_13`): Before requesting a Wallet Provider to revoke a Wallet Unit per WURevocation_11, the PID Provider SHALL ensure that the revocation does not harm the interests of any of the stakeholders. The PID Provider SHALL include a documented policy ensuring tha
- **EW-DM-38-015** (`WURevocation_14`): A Wallet Provider SHALL inform a User without delay, and within 24 hours at most, in case the Wallet Provider decided to revoke the User's Wallet Unit. The Wallet Provider SHALL also inform the User about the reason(s) for the revocation. This inform
  - *Note:* Functions that remain available to the User may include viewing their own attributes in their Wallet Unit and accessing their account at the Wallet Provider.
- **EW-DM-38-016** (`WURevocation_15`): Empty
- **EW-DM-38-017** (`WURevocation_16`): To inform a User about the revocation of their Wallet Unit, the Wallet Provider SHALL use a communication channel that is independent of the Wallet Unit. In addition, the Wallet Provider MAY use the Wallet Unit itself to inform the User.

### Topic 56: Wallet Provider Support and Maintenance (+4 HLRs)

- **AS-WP-56-001** (`WPSM_01`): A Wallet Provider SHALL monitor their installed base of operational Wallet Instances for maintenance purposes, and determine and document in a transparent manner the data it needs and is allowed to monitor in order to deliver the required support. Da
- **AS-WP-56-002** (`WPSM_02`): Wallet Providers SHALL, for maintenance purposes, write custom crash logs for sending them for further analysis.
- **AS-WP-56-003** (`WPSM_03`): A Wallet Provider SHALL monitor the security posture of its operational Wallet Instances for the purpose of detecting critical security risks in the environment the Wallet Instance is run at, and determine and document in a transparent manner the dat
- **AS-WP-56-004** (`WPSM_04`): During the lifetime of the Wallet Unit, the Wallet Provider SHALL update the Wallet Unit as necessary to ensure its continued security and functionality.


## Removed HLRs (11)

- **AS-WP-38-003** (`WURevocation_07`) [Topic 38]: A Wallet Provider SHALL be able to revoke a Wallet Unit by revoking its WUA(s), as specified in [[Topic 7](./annex-2.02-high-level-requirements-by-topic.md#a235-topic-7---attestation-revocation-and-revocation-checking)].*
- **AS-WP-38-004** (`WURevocation_09`) [Topic 38]: During the lifetime of a Wallet Unit, the Wallet Provider SHALL regularly verify that the security of the Wallet Unit is not breached or compromised. If the Wallet Provider detects a security breach or compromise, the Wallet Provider SHALL analyse it
- **AS-WP-38-005** (`WURevocation_9b`) [Topic 38]: If within three months from an administrative suspension of a Wallet Unit the security breach or compromise is remedied, the Wallet Provider SHALL issue one or more WUAs to the Wallet Unit, such that the User can again use it.
- **AS-WP-38-006** (`WURevocation_10`) [Topic 38]: A Wallet Provider SHALL revoke a Wallet Unit upon the explicit request of the User registered during the Wallet Unit activation process, see [Topic 40](./annex-2.02-high-level-requirements-by-topic.md#a2323-topic-40---wallet-instance-installation-and
- **AS-WP-38-007** (`WURevocation_11`) [Topic 38]: A Wallet Provider SHALL revoke a Wallet Unit upon the explicit request of a PID Provider, in case the natural person using the Wallet Unit has died or the legal person using the Wallet Unit has ceased operations. To do so, the Wallet Provider SHALL r
- **AS-WP-38-008** (`WURevocation_12`) [Topic 38]: Before revoking a Wallet Unit per WURevocation_11, the Wallet Provider SHALL verify that the party requesting revocation is indeed a valid PID Provider listed in the Trusted List of PID Providers.
- **AS-WP-38-009** (`WURevocation_13`) [Topic 38]: Before requesting a Wallet Provider to revoke a Wallet Unit per WURevocation_11, the PID Provider SHALL ensure that the revocation does not harm the interests of any of the stakeholders. The PID Provider SHALL have (and follow) a documented policy to
- **AS-WP-38-010** (`WURevocation_14`) [Topic 38]: A Wallet Provider SHALL inform a User without delay, and within 24 hours at most, in case the Wallet Provider decided to revoke the User's Wallet Unit. The Wallet Provider SHALL also inform the User about the reason(s) for the revocation. This inform
- **AS-WP-38-011** (`WURevocation_16`) [Topic 38]: To inform a User about the revocation of their Wallet Unit, the Wallet Provider SHALL use a communication channel that is independent of the Wallet Unit. In addition, the Wallet Provider MAY use the Wallet Unit itself to inform the User.
- **AS-WP-38-012** (`WURevocation_18`) [Topic 38]: A PID Provider issuing revocable PIDs SHALL, for each of its valid PIDs, regularly verify whether the Wallet Provider revoked the Wallet Unit on which that PID is residing, using the revocation information in the WUA it received during issuance of th
- **AS-WP-38-013** (`WURevocation_19`) [Topic 38]: An Attestation Provider issuing revocable attestations MAY decide to revoke an attestation if the Wallet Provider revoked the Wallet Unit on which that attestation is residing, in the same manner as described in WURevocation_18. An Attestation Provid


## Changed HLR Texts (247)

### Topic 1 (11 changes)

- **EW-PIO-01-003** (`OIA_03`): ⚡ **Was empty, now has content:** When issuing, presenting, or verifying an attestation, Wallet Units, PID Providers, Attestation Providers, and Relying Parties SHALL only use cryptographic algorithms included in the [ECCG Agreed Cryptographic Mechanisms v2.0](https://certification.e
- **EW-PIO-01-005** (`OIA_03b`): text modified
- **EW-PIO-01-006** (`OIA_03c`): text modified
- **EW-PIO-01-009** (`OIA_06`): text modified
- **EW-PIO-01-010** (`OIA_07`): text modified
- **EW-PIO-01-013** (`OIA_08b`): text modified
- **EW-PIO-01-015** (`OIA_08d`): text modified
- **EW-PIO-01-017** (`OIA_09`): text modified
- **EW-PIO-01-018** (`OIA_10`): text modified
- **EW-PIO-01-019** (`OIA_11`): text modified
- **EW-PIO-01-020** (`OIA_12`): text modified

### Topic 3 (2 changes)

- **EW-DM-03-04** (`PID_04`): text modified
- **EW-DM-03-05** (`PID_05`): text modified

### Topic 6 (7 changes)

- **AS-RP-06-001** (`RPA_02a`): ⚠️ **Emptied** (was: The technical specifications mentioned in RPA_02 SHALL ensure that a Relying Party Instance includes its access certificates in the presentation request by value, not by reference.)
- **AS-WP-06-001** (`RPA_01`): text modified
- **AS-WP-06-003** (`RPA_02`): text modified
- **AS-WP-06-004** (`RPA_03`): text modified
- **AS-WP-06-005** (`RPA_04`): text modified
- **AS-WP-06-007** (`RPA_06`): text modified
- **AS-WP-06-009** (`RPA_07`): text modified

### Topic 7 (17 changes)

- **AS-AP-07-004** (`VCR_03`): text modified
- **AS-AP-07-008** (`VCR_06`): text modified
- **AS-AP-07-010** (`VCR_07a`): text modified
- **AS-AP-07-011** (`VCR_07b`): text modified
- **AS-AP-07-012** (`VCR_08`): text modified
- **AS-AP-07-013** (`VCR_09`): text modified
- **AS-AP-07-014** (`VCR_10`): text modified
- **AS-AP-07-015** (`VCR_11`): text modified
- **AS-AP-07-016** (`VCR_12`): text modified
- **AS-AP-07-017** (`VCR_12a`): text modified
- **AS-AP-07-018** (`VCR_13`): text modified
- **AS-AP-07-019** (`VCR_14`): text modified
- **AS-AP-07-020** (`VCR_15`): text modified
- **AS-AP-07-021** (`VCR_16`): text modified
- **AS-AP-07-022** (`VCR_17`): text modified
- **AS-AP-07-023** (`VCR_18`): text modified
- **AS-AP-07-024** (`VCR_19`): text modified

### Topic 9 (20 changes)

- **AS-WP-09-001** (`WUA_01`): text modified
- **AS-WP-09-003** (`WUA_03`): text modified
- **AS-WP-09-004** (`WUA_04`): ⚡ **Was empty, now has content:** When issuing, presenting, or verifying a WUA, Wallet Providers, Wallet Units, PID Providers, and Attestation Providers SHALL only use cryptographic algorithms included in the [ECCG Agreed Cryptographic Mechanisms v2.0](https://certification.enisa.eur
- **AS-WP-09-005** (`WUA_05`): text modified
- **AS-WP-09-006** (`WUA_05a`): text modified
- **AS-WP-09-008** (`WUA_07`): text modified
- **AS-WP-09-010** (`WUA_09`): text modified
- **AS-WP-09-011** (`WUA_10`): text modified
- **AS-WP-09-012** (`WUA_11`): text modified
- **AS-WP-09-013** (`WUA_11a`): text modified
- **AS-WP-09-014** (`WUA_11b`): ⚠️ **Emptied** (was: During issuance of a PID, the PID Provider SHOULD verify a proof of cryptographic binding generated by the WSCA/WSCD per requirement ACP_01, if present, to verify that the new PID private key is manag)
- **AS-WP-09-015** (`WUA_12`): text modified
- **AS-WP-09-017** (`WUA_14`): text modified
- **AS-WP-09-019** (`WUA_16`): ⚠️ **Emptied** (was: If the WSCA/WSCD is able to export a private key, the Wallet Provider SHALL specify this capability as an attribute in the WUA.)
- **AS-WP-09-020** (`WUA_17`): ⚠️ **Emptied** (was: A Wallet Provider SHALL consider all relevant factors, including offline usage, interoperability, and the risk of a WUA becoming a vector to track the User, when deciding on the validity period of a W)
- **AS-WP-09-021** (`WUA_18`): text modified
- **AS-WP-09-022** (`WUA_19`): ⚡ **Was empty, now has content:** A Wallet Provider SHALL consider all relevant factors, including offline usage, interoperability, and the risk of a WUA becoming a vector to track the User, when deciding on the validity period of a WUA. 
- **AS-WP-09-023** (`WUA_20`): ⚠️ **Emptied** (was: A Wallet Provider SHALL ensure that its Wallet Units comply with all relevant requirements specified in [Technical Specification 3](../../technical-specifications/ts3-wallet-unit-attestation.md).)
- **AS-WP-09-024** (`WUA_20a`): ⚠️ **Emptied** (was: A PID Provider or Attestation Provider SHALL comply with all relevant requirements specified in [Technical Specification 3](../../technical-specifications/ts3-wallet-unit-attestation.md).)
- **AS-WP-09-025** (`WUA_21`): ⚡ **Was empty, now has content:** A Wallet Provider SHALL ensure that its Wallet Units comply with all relevant requirements specified in [Technical Specification 3](../../technical-specifications/ts3-wallet-unit-attestation.md).

### Topic 10 (64 changes)

- **AS-AP-10-001** (`ISSU_01a`): text modified
- **AS-AP-10-003** (`ISSU_03`): text modified
- **AS-AP-10-007** (`ISSU_07`): text modified
- **AS-AP-10-008** (`ISSU_08`): text modified
- **AS-AP-10-010** (`ISSU_10`): text modified
- **AS-AP-10-015** (`ISSU_12b`): text modified
- **AS-AP-10-022** (`ISSU_17`): text modified
- **AS-AP-10-025** (`ISSU_19`): text modified
- **AS-AP-10-026** (`ISSU_19a`): text modified
- **AS-AP-10-028** (`ISSU_21`): text modified
- **AS-AP-10-029** (`ISSU_22`): text modified
- **AS-AP-10-030** (`ISSU_22a`): ⚠️ **Emptied** (was: A PID Provider SHALL sign its metadata (as defined in OpenID4VCI) using the private key corresponding to its PID Provider access certificate.)
- **AS-AP-10-031** (`ISSU_22b`): ⚠️ **Emptied** (was: The common OpenID4VCI protocol referenced in requirement ISSU_01, or an EUDI Wallet-specific extension or profile thereof, SHALL enable a PID Provider or Attestation Provider to include its access cer)
- **AS-AP-10-032** (`ISSU_23`): text modified
- **AS-AP-10-035** (`ISSU_24`): text modified
- **AS-AP-10-036** (`ISSU_24a`): text modified
- **AS-AP-10-039** (`ISSU_27`): text modified
- **AS-AP-10-043** (`ISSU_28`): text modified
- **AS-AP-10-045** (`ISSU_30`): text modified
- **AS-AP-10-046** (`ISSU_31`): ⚡ **Was empty, now has content:** Before issuing an attestation, an Attestation Provider SHALL: - verify that the Wallet Provider mentioned in the Wallet Unit's WIA is present in the Wallet Provider LoTE. - authenticate and validate the WIA using the trust anchor(s) registered for th
- **AS-AP-10-047** (`ISSU_32`): ⚠️ **Emptied** (was: An Attestation Provider SHALL include its Attestation Provider access certificate and registration certificate(s) in its Issuer metadata used in the common OpenID4VCI protocol referenced in ISSU_01.)
- **AS-AP-10-048** (`ISSU_32a`): text modified
- **AS-AP-10-049** (`ISSU_33`): ⚠️ **Emptied** (was: For the verification of Attestation Provider access certificates, a Wallet Unit SHALL accept the trust anchors in all applicable Access Certificate Authority Trusted List(s).)
- **AS-AP-10-050** (`ISSU_33a`): text modified
- **AS-AP-10-051** (`ISSU_33b`): text modified
- **AS-AP-10-052** (`ISSU_34`): text modified
- **AS-AP-10-053** (`ISSU_34a`): text modified
- **AS-AP-10-054** (`ISSU_35`): text modified
- **AS-AP-10-055** (`ISSU_35a`): text modified
- **AS-AP-10-056** (`ISSU_35b`): text modified
- **AS-AP-10-057** (`ISSU_36`): text modified
- **AS-AP-10-058** (`ISSU_37`): text modified
- **AS-AP-10-059** (`ISSU_38`): text modified
- **AS-AP-10-060** (`ISSU_39`): text modified
- **AS-AP-10-061** (`ISSU_40`): text modified
- **AS-AP-10-062** (`ISSU_41`): text modified
- **AS-AP-10-063** (`ISSU_42`): text modified
- **AS-AP-10-064** (`ISSU_43`): text modified
- **AS-AP-10-065** (`ISSU_44`): text modified
- **AS-AP-10-066** (`ISSU_45`): text modified
- **AS-AP-10-067** (`ISSU_46`): text modified
- **AS-AP-10-068** (`ISSU_47`): text modified
- **AS-AP-10-069** (`ISSU_48`): text modified
- **AS-AP-10-070** (`ISSU_49`): text modified
- **AS-AP-10-071** (`ISSU_50`): text modified
- **AS-AP-10-072** (`ISSU_51`): text modified
- **AS-AP-10-073** (`ISSU_52`): text modified
- **AS-AP-10-074** (`ISSU_53`): text modified
- **AS-AP-10-075** (`ISSU_54`): text modified
- **AS-AP-10-076** (`ISSU_55`): text modified
- **AS-AP-10-077** (`ISSU_56`): text modified
- **AS-AP-10-078** (`ISSU_56a`): text modified
- **AS-AP-10-079** (`ISSU_57`): text modified
- **AS-AP-10-080** (`ISSU_57a`): text modified
- **AS-AP-10-081** (`ISSU_58`): ⚠️ **Emptied** (was: A Wallet Unit SHALL give its User the option to manually initiate a re-issuance process for any of the PIDs or attestations in their Wallet Unit.)
- **AS-AP-10-082** (`ISSU_59`): text modified
- **AS-AP-10-083** (`ISSU_60`): ⚠️ **Emptied** (was: A Wallet Unit SHALL gracefully handle situations in which re-issuance of a PID, attestation, or WUA is refused by the PID Provider, Attestation Provider, or Wallet Provider,for example by attempting a)
- **AS-AP-10-084** (`ISSU_61`): text modified
- **AS-AP-10-085** (`ISSU_62`): text modified
- **AS-AP-10-086** (`ISSU_63`): text modified
- **AS-AP-10-087** (`ISSU_64`): text modified
- **AS-AP-10-088** (`ISSU_65`): text modified
- **AS-AP-10-089** (`ISSU_66`): text modified
- **EW-PIO-10-001** (`ISSU_01`): text modified

### Topic 11 (9 changes)

- **AS-WP-11-004** (`PA_04`): text modified
- **AS-WP-11-005** (`PA_05`): text modified
- **AS-WP-11-010** (`PA_09`): text modified
- **AS-WP-11-013** (`PA_12`): text modified
- **AS-WP-11-015** (`PA_14`): text modified
- **AS-WP-11-016** (`PA_15`): text modified
- **AS-WP-11-017** (`PA_16`): text modified
- **AS-WP-11-021** (`PA_20`): text modified
- **AS-WP-11-023** (`PA_22`): text modified

### Topic 12 (7 changes)

- **EW-DM-12-002** (`ARB_01b`): text modified
- **EW-DM-12-010** (`ARB_07`): text modified
- **EW-DM-12-028** (`ARB_25`): text modified
- **EW-DM-12-029** (`ARB_26`): text modified
- **EW-DM-12-030** (`ARB_27`): ⚠️ **Emptied** (was: The Scheme Provider for an Attestation Rulebook describing a type of attestation that is a QEAA, PuB-EAA, or non-qualified EAA SHOULD specify in the Rulebook whether a Relying Party receiving the atte)
- **EW-DM-12-031** (`ARB_28`): text modified
- **EW-DM-12-035** (`ARB_32`): ⚠️ **Emptied** (was: If an Attestation Rulebook specifies a [SD-JWT VC]-compliant attestation, the Scheme Provider for that Attestation Rulebook SHOULD consider defining a JSON Schema for it, as defined in Section 6.5 of )

### Topic 16 (4 changes)

- **AS-WP-16-020** (`QES_19`): text modified
- **AS-WP-16-024** (`QES_23`): text modified
- **AS-WP-16-025** (`QES_24`): text modified
- **AS-WP-16-026** (`QES_24a`): text modified

### Topic 18 (2 changes)

- **AS-AP-18-002** (`ACP_06`): ⚠️ **Emptied** (was: A Cryptographic Binding of Attestations scheme SHALL enable a PID Provider or Attestation Provider, during the issuance of a PID or attestation, to request and obtain proof that the private key for th)
- **AS-MS-18-001** (`ACP_02`): text modified

### Topic 19 (17 changes)

- **AS-WP-19-003** (`DASH_02a`): text modified
- **AS-WP-19-006** (`DASH_03`): text modified
- **AS-WP-19-007** (`DASH_03a`): text modified
- **AS-WP-19-010** (`DASH_04`): text modified
- **AS-WP-19-011** (`DASH_05`): text modified
- **AS-WP-19-012** (`DASH_05a`): text modified
- **AS-WP-19-013** (`DASH_06`): text modified
- **AS-WP-19-014** (`DASH_06a`): text modified
- **AS-WP-19-015** (`DASH_06b`): text modified
- **AS-WP-19-016** (`DASH_07`): text modified
- **AS-WP-19-017** (`DASH_08`): text modified
- **AS-WP-19-018** (`DASH_09`): text modified
- **AS-WP-19-019** (`DASH_09a`): text modified
- **AS-WP-19-020** (`DASH_09b`): text modified
- **AS-WP-19-021** (`DASH_10`): text modified
- **AS-WP-19-022** (`DASH_11`): text modified
- **AS-WP-19-023** (`DASH_12`): ⚠️ **Emptied** (was: The User interface referred to in DASH_08 SHALL enable the User, for each presentation transaction in the log, to easily request the Relying Party to delete any or all attributes presented to it in th)

### Topic 20 (6 changes)

- **AS-WP-20-001** (`SUA_01`): text modified
- **AS-WP-20-002** (`SUA_02`): text modified
- **AS-WP-20-003** (`SUA_03`): text modified
- **AS-WP-20-004** (`SUA_04`): text modified
- **AS-WP-20-005** (`SUA_05`): text modified
- **AS-WP-20-006** (`SUA_06`): text modified

### Topic 24 (1 changes)

- **EW-PIO-24-005** (`ProxId_04`): text modified

### Topic 27 (26 changes)

- **AS-MS-27-012** (`Reg_10`): text modified
- **AS-MS-27-013** (`Reg_11`): text modified
- **AS-MS-27-014** (`Reg_12`): text modified
- **AS-MS-27-015** (`Reg_13`): ⚠️ **Emptied** (was: The common Certificate Policy mentioned in Reg_12 SHALL require that an Access Certificate Authority logs all issued access certificates for Certificate Transparency (CT), according to all requirement)
- **AS-MS-27-016** (`Reg_14`): ⚠️ **Emptied** (was: The common Certificate Policy mentioned in Reg_12 SHALL require that an Access Certificate Authority provides one or more method(s) to revoke the access certificates it issued.)
- **AS-MS-27-017** (`Reg_15`): ⚠️ **Emptied** (was: The common Certificate Policy mentioned in Reg_12 SHALL include a policy for revocation, which SHALL require that an Access Certificate Authority revokes an access certificate at least when: - the cer)
- **AS-MS-27-018** (`Reg_16`): ⚠️ **Emptied** (was: The common Certificate Policy mentioned in Reg_12 SHALL specify the profile of access certificates in detail.)
- **AS-MS-27-020** (`Reg_18`): ⚠️ **Emptied** (was: The common Certificate Policy mentioned in Reg_12 SHALL define the minimum change history information to be stored for resolving possible disputes regarding registration.)
- **AS-MS-27-021** (`Reg_19`): ⚠️ **Emptied** (was: A Member State SHALL approve a PID Provider according to a well-defined policy before including it in its PID Provider Registry. To that end, a Member State SHALL define specific vetting processes and)
- **AS-MS-27-022** (`Reg_20`): text modified
- **AS-MS-27-023** (`Reg_20a`): text modified
- **AS-MS-27-024** (`Reg_20b`): text modified
- **AS-MS-27-025** (`Reg_21`): text modified
- **AS-MS-27-026** (`Reg_22`): text modified
- **AS-MS-27-027** (`Reg_22a`): text modified
- **AS-MS-27-028** (`Reg_22b`): text modified
- **AS-MS-27-029** (`Reg_23`): ⚡ **Was empty, now has content:** A Registrar SHALL have a policy for the suspension or cancellation of a registered Attestation Provider, which SHALL specify that an Attestation Provider is suspended or cancelled at least on request of the Attestation Provider or of a competent nati
- **AS-MS-27-030** (`Reg_24`): ⚠️ **Emptied** (was: A Member State SHALL enable a Relying Party to register remotely, using an API or user interface.)
- **AS-MS-27-031** (`Reg_25`): text modified
- **AS-MS-27-032** (`Reg_26`): text modified
- **AS-MS-27-033** (`Reg_27`): ⚡ **Was empty, now has content:** With respect to Reg_25, a Member State SHALL consider whether a registering entity intends to act as an intermediary.
- **AS-MS-27-035** (`Reg_29`): ⚠️ **Emptied** (was: A Member State SHALL have a policy for the cancellation of a registered Relying Party, which SHALL specify that a Relying Party is cancelled at least on request of the Relying Party or of a competent )
- **AS-MS-27-036** (`Reg_30`): ⚡ **Was empty, now has content:** A Member State SHALL have a policy for the cancellation of a registered Relying Party, which SHALL specify that a Relying Party is cancelled at least on request of the Relying Party or of a competent national authority.
- **AS-MS-27-037** (`Reg_31`): ⚠️ **Emptied** (was: The common Certificate Policy mentioned in Reg_12 SHALL require that an access certificate contains a name for the PID Provider, QEAA Provider, PuB-EAA Provider, non-qualified EAA Provider, or Relying)
- **AS-MS-27-038** (`Reg_32`): text modified
- **AS-MS-27-039** (`Reg_33`): ⚡ **Was empty, now has content:** The common Certificate Policy mentioned in Reg_12 SHALL require that an access certificate contains an EU-wide unique identifier for the PID Provider, QEAA Provider, PuB-EAA Provider, non-qualified EAA Provider, or Relying Party, and SHALL specify a 

### Topic 28 (3 changes)

- **AS-AP-28-001** (`LP_02`): ⚠️ **Emptied** (was: The attestation type of a legal-person PID SHALL be different from the attestation type of a natural person PID.)
- **AS-MS-28-001** (`LP_01`): ⚠️ **Emptied** (was: The Commission SHALL develop a Legal-person PID Rulebook to specify the attestation scheme and other technical details applicable for legal-person PIDs.)
- **EW-DM-28-001** (`LP_03`): ⚠️ **Emptied** (was: A legal-person PID SHALL comply with all requirements in the Legal-person PID Rulebook mentioned in LP_01.)

### Topic 30 (2 changes)

- **AS-WP-30-017** (`W2W_18`): ⚠️ **Emptied** (was: When receiving a presentation request, a Holder Wallet Unit SHOULD verify the validity of the Verifier Wallet Unit before presenting a received request to the Holder, provided [Technical Specification)
- **AS-WP-30-020** (`W2W_21`): text modified

### Topic 31 (15 changes)

- **AS-MS-31-003** (`GenNot_03`): text modified
- **AS-MS-31-005** (`GenNot_05`): text modified
- **AS-MS-31-008** (`PPNot_04`): text modified
- **AS-MS-31-009** (`PPNot_05`): text modified
- **AS-MS-31-010** (`PPNot_06`): text modified
- **AS-MS-31-011** (`PPNot_07`): text modified
- **AS-MS-31-013** (`PuBPNot_03`): text modified
- **AS-MS-31-017** (`RPACANot_04`): text modified
- **AS-MS-31-018** (`RPACANot_05`): text modified
- **AS-WP-31-003** (`WPNot_02`): text modified
- **AS-WP-31-004** (`WPNot_03`): text modified
- **AS-WP-31-005** (`WPNot_04`): text modified
- **AS-WP-31-006** (`WPNot_05`): text modified
- **AS-WP-31-009** (`RPACANot_02`): text modified
- **AS-WP-31-012** (`TLPub_06`): text modified

### Topic 34 (3 changes)

- **AS-WP-34-001** (`Mig_01`): text modified
- **AS-WP-34-004** (`Mig_03a`): text modified
- **AS-WP-34-010** (`Mig_07a`): text modified

### Topic 38 (4 changes)

- **AS-WP-38-001** (`WURevocation_01`): text modified
- **AS-WP-38-002** (`WURevocation_02`): ⚠️ **Emptied** (was: During the lifetime of the Wallet Unit, the Wallet Provider SHALL ensure that the Wallet Unit at all times is in possession of at least one valid WUA.)
- **EW-DM-38-001** (`WURevocation_03`): ⚡ **Was empty, now has content:** A Wallet Provider SHALL have a policy governing all aspects of WUA issuance and management. The policy SHALL distinguish between WUAs for WSCA/WSCDs and WUAs for keystores. For WUAs describing a WSCA/WSCD, the policy SHALL comply with at least the ex
- **EW-DM-38-005** (`WURevocation_08`): ⚡ **Was empty, now has content:** A Wallet Provider SHALL be able to revoke a Wallet Unit by revoking its WUA(s), as specified in [[Topic 7](./annex-2.02-high-level-requirements-by-topic.md#a235-topic-7---attestation-revocation-and-revocation-checking)].

### Topic 40 (16 changes)

- **AS-WP-40-005** (`WIAM_05`): text modified
- **AS-WP-40-008** (`WIAM_08`): text modified
- **AS-WP-40-009** (`WIAM_09`): text modified
- **AS-WP-40-010** (`WIAM_10`): text modified
- **AS-WP-40-012** (`WIAM_11`): ⚠️ **Emptied** (was: During the lifetime of the Wallet Unit, the Wallet Provider SHALL update the Wallet Unit as necessary to ensure its continued security and functionality. )
- **AS-WP-40-013** (`WIAM_12`): text modified
- **AS-WP-40-015** (`WIAM_13`): text modified
- **AS-WP-40-016** (`WIAM_13a`): text modified
- **AS-WP-40-017** (`WIAM_14`): text modified
- **AS-WP-40-018** (`WIAM_14a`): text modified
- **AS-WP-40-019** (`WIAM_14b`): text modified
- **AS-WP-40-020** (`WIAM_14c`): text modified
- **AS-WP-40-023** (`WIAM_15b`): text modified
- **AS-WP-40-024** (`WIAM_15c`): text modified
- **AS-WP-40-025** (`WIAM_16`): text modified
- **AS-WP-40-026** (`WIAM_17`): text modified

### Topic 42 (1 changes)

- **AS-AP-42-002** (`QTSPAS_02`): text modified

### Topic 44 (4 changes)

- **AS-AP-44-004** (`RPRC_22`): text modified
- **EW-DM-44-001** (`RPRC_01`): text modified
- **EW-DM-44-002** (`RPRC_02`): ⚠️ **Emptied** (was: The Commission SHALL ensure that a technical specification is created, describing at least 1. the contents and format of registration certificates for Relying Parties, see the other requirements in th)
- **EW-DM-44-018** (`RPRC_19a`): text modified

### Topic 51 (1 changes)

- **AS-WP-51-006** (`PAD_06`): ⚠️ **Emptied** (was: If the User uninstalls the Wallet Instance, the Wallet Instance SHALL request the associated WSCA/WSCD and keystore(s) to delete all cryptographic assets related to the Wallet Unit and to all PIDs and)

### Topic 52 (2 changes)

- **AS-RP-51-005** (`RPI_05`): text modified
- **AS-RP-51-009** (`RPI_07a`): text modified

### Topic 53 (1 changes)

- **EW-DM-51-007** (`ZKP_08`): text modified

### Topic 55 (2 changes)

- **AS-MS-55-004** (`CT_04`): text modified
- **AS-MS-55-006** (`CT_06`): text modified

