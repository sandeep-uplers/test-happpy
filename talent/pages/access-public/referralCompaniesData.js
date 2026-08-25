'use client';

/**
 * Companies where users got positive referral responses. Grouped by company size.
 * Logo base URL: https://d1h53oncnz25tl.cloudfront.net/company/logo/
 */

export const REFERRAL_LOGO_BASE = "https://d1h53oncnz25tl.cloudfront.net/company/logo/";

const REFERRAL_COMPANIES_CSV = `Zee Entertainment Enterprises Limited;lin_Zee_Entertainment_Enterprises_Limited_1742392570_m9etl4bHu0.jpeg;5000
R360 Group;lin_R360_Group_1739192123_nyosuR8l7z.jpeg;200
H&M Group;lin_H_M_Group_1744037155_RmdKuKFqLP.jpeg;10001
Precisely;91041772194635.jpeg;2801
mPokket;lin_mPokket_1739543172_dB3zRWjt5H.jpeg;5000
SpotDraft;lin_SpotDraft_1742991442_ifcB7ydHl3.jpeg;500
Siemens;lin_Siemens_1740800852_DhwRAnRGr5.jpeg;10001
Clarivate;lin_clarivate_com_1747393664_MeP2FT4SR9.png;65
UrbanPiper;lin_UrbanPiper_1739543138_h5fAcq1Jxs.jpeg;500
athenahealth;lin_athenahealth_1739191159_0oeyrAKqNH.jpeg;10000
Wayfair;lin_Wayfair_1734440054_pYnyEFsLeP.jpeg;10001
DigitalOcean;lin_DigitalOcean_1746790405_fO3G41Dm8i.jpeg;5000
WeWork India;lin_WeWork_India_1739457919_gAgdnbMpFS.jpeg;500
Kaseya;lin_Kaseya_1739355154_cWdYhDHYVn.jpeg;10000
Freecharge;lin_Freecharge_1741338493_3knEaz9YhA.jpeg;1000
Thomson Reuters;lin_Thomson_Reuters_1742375108_PLIqyrTeYE.jpeg;10001
Zuora;69591728555379.png;5000
SAP Fioneer;lin_SAP_Fioneer_1744607375_rCW3pK42Cf.jpeg;5000
Hewlett Packard Enterprise;lin_Hewlett_Packard_Enterprise_1739191634_uPXXHfZeMC.jpeg;10001
Flexera;94081728555368.png;1600
GE HealthCare;lin_GE_HealthCare_1744037455_FGFq0Iht5R.jpeg;10001
Credit Saison India;lin_Credit_Saison_India_1742991701_OJf2MfNM6V.jpeg;1000
Mercari India;lin_Mercari_India_1739538104_VI7LWIV0qr.jpeg;200
Storable India;59331734586323.png;1000
Thales;lin_Thales_1744037427_WyVEx5U6pS.jpeg;10001
Gainsight;lin_Gainsight_1743584876_uM47wQnJff.jpeg;5000
Swiggy;lin_Swiggy_1741258970_okvqdp0sol.jpeg;10001
Perforce Software;lin_Perforce_Software_1744102437_yz1wZ7nZP3.jpeg;5000
Khatabook;lin_Khatabook_1740565832_9BF9wc4anv.jpeg;200
Foodhub;lin_Foodhub_1761724983_WxYddSDFwt.jpeg;5
GoTo;lin_GoTo_1743585330_KWgkhzGEOa.jpeg;5000
Socure;lin_Socure_1740410535_oPUXqLP4xH.jpeg;1000
Exotel;lin_Exotel_1739458083_NIgnxGlcHP.jpeg;5000
Priceline;lin_Priceline_1745212384_AVbnrHZeoP.jpeg;5000
Bloomreach;lin_Bloomreach_1741342209_LLJBJJKijJ.jpeg;1000
TIBCO;lin_TIBCO_1744294359_ZBjZDs2xYN.jpeg;5000
Egnyte;30911728555378.png;5000
Provenir;lin_Provenir_1746773993_MXjTEfUYOu.jpeg;500
Level AI;lin_Level_AI_1741345887_gVNmPrTK4x.jpeg;80
TraceLink;lin_TraceLink_1739075497_cq8xLHJDPJ.jpeg;1000
project44;lin_project44_1740398733_U2Zurqq3T4.jpeg;1000
Google;lin_Google_1741671189_PjcaKfC03C.jpeg;10001
Databricks;lin_Databricks_1733163125_xeA3HiBv5E.jpeg;10000
Squint Metrics;lin_Squint_Metrics_1763101572_dzBdiTIcmC.jpeg;50
Bluecore;lin_Bluecore_1743587478_kapN5YvnLi.jpeg;500
Diligent;lin_Diligent_1744123914_R5mlQ0ZKXG.jpeg;5000
"Strobes Security, Inc.";lin_Strobes_Security__Inc__1756272896_X57snqvcgL.jpeg;200
MakeMyTrip;lin_MakeMyTrip_1742197577_2OtWO5G3TM.jpeg;5000
Celonis;lin_Celonis_1734440230_YQiK1swY8d.jpeg;5000
PW (PhysicsWallah);lin_PW__PhysicsWallah__1740653083_pc6sHHoBv2.jpeg;10001
SentinelOne;92151728555365.png;1200
Shopy;lin_Shopy_1741342299_ID9hu93qwT.jpeg;200
Hevo Data;lin_Hevo_Data_1740653750_0Sqpfm63My.jpeg;500
Breakout;lin_Breakout_1763975427_R0WgYrhwWJ.jpeg;50
Acceldata;lin_Acceldata_1741344341_TBZrAOtglr.jpeg;180
iBase-t;lin_iBase_t_1740750867_5agIci1xyc.jpeg;500
Brevo;lin_Brevo_1745852194_l17xaXDnku.jpeg;1000
Ditto Insurance;lin_Ditto_Insurance_1742991709_DW0XoXScO6.jpeg;1000
Teamified;lin_Teamified_1764142814_IbLIKYR1WQ.jpeg;500
nurdsoft;lin_nurdsoft_1764142826_nZR45NRKDR.jpeg;50
ZoomInfo;lin_ZoomInfo_1739200570_r6NcYDpjLt.jpeg;5000
Razorpay;lin_Razorpay_1734438406_hxPmYfPHCF.jpeg;5000
Practo;lin_Practo_1742392107_l4J9NyIH2X.jpeg;1530
Nasdaq;lin_Nasdaq_1739191516_azqH3yCqUY.jpeg;5000
Netskope;lin_Netskope_1738233163_9RsS3ZUQdz.jpeg;5000
Freshworks;lin_Freshworks_1742992295_6rk1L200Xl.jpeg;10000
Iron Mountain;lin_Iron_Mountain_1753280952_f70rBTifPE.jpeg;10001
Luma Financial Technologies;lin_Luma_Financial_Technologies_1743594863_UdPrEwYzLA.jpeg;200
Ivanti;28501728555369.png;2000
Eptura;lin_Eptura_1746776253_q6aqCu3zHj.jpeg;5000
Autodesk;lin_Autodesk_1739191188_Z2Oy8GvTHF.jpeg;10001
Genesys;lin_Genesys_1733160159_eqfbwvhkfp.jpeg;10000
HighLevel;18651728465130.png;1200
Apple;lin_Apple_Inc__1741341152_1XWovQM3SA.jpeg;10000
Dell Technologies;lin_Dell_Technologies_1739191271_ew5Hwpf0Sp.jpeg;10001
Automation Anywhere;lin_Automation_Anywhere_1734028383_vmSMbNX8l6.jpeg;5000
Hyly.AI;lin_Hyly_AI_1759215229_O3PhBpgjaP.jpeg;200
Wolters Kluwer;lin_Wolters_Kluwer_1744037506_qZ0nvRLGS8.jpeg;10001
Zendesk;lin_Zendesk_1744124112_DEPhE43Mjq.jpeg;10000
ConveGenius.AI;lin_ConveGenius_AI_1739192043_TmcWhrgigf.jpeg;1000
Oleria;lin_Oleria_1743676834_UKfc3aQS0f.jpeg;50
F5;lin_F5_1744037575_4CnUOk7oLD.jpeg;10000
eBay;lin_eBay_1744037679_Xp5yPfU5DB.jpeg;10001
Findem;lin_Findem_1739454246_viPpjYlq6L.jpeg;200
Granicus;lin_Granicus_1739453786_Qt0NebbuqG.jpeg;5000
Tripjack;lin_Tripjack_1746777652_Ywk7JyKNdW.jpeg;1000
Uffizio;lin_Uffizio_1740750714_NpFL2H3ESd.jpeg;200
Neutrinos ;lin_Neutrinos__1740750945_HIcN7VsWhr.jpeg;500
Kapture CX;lin_Kapture_CX_1740653568_U1uagH70Q0.jpeg;500
Tvarit;88481741244500.png;200
Toyota Connected India;lin_Toyota_Connected_India_1743603384_APThcUQc4M.jpeg;500
Eltropy;lin_eltropy_com_1747393751_imL7WVNezP.jpeg;113
Uber;lin_Uber_1741765416_uSbGpbTcyK.jpeg;10001
Microsoft;lin_Microsoft_1741767998_8ajiN55pYd.jpeg;10001
Jivi;lin_jivi_ai_1747395252_wxILJ99gHD.jpeg;29
Proximity Works;lin_Proximity_Works_1733162077_pbYAzULLe9.jpeg;200
Ajackus;lin_Ajackus_1765348645_SnVmCF4oos.jpeg;200
Checkmarx;lin_Checkmarx_1740550732_CLy2nCFnl6.jpeg;1000
Black Duck;lin_Black_Duck_1743587100_GPLx7uuhFh.jpeg;10000
Vyapar;lin_Vyapar_1742473795_43wpSo396a.jpeg;1000
Moniepoint;99661728549019.png;5000
Kognitos;lin_Kognitos_1745212645_WEu3wmVGiL.jpeg;200
Sprinto;lin_Sprinto_1739453866_dl0rGO7dyU.jpeg;500
MongoDB;lin_MongoDB_1741782472_nepiN5VRBz.jpeg;10000
Aviso AI;lin_Aviso_AI_1756273021_PYEJee16Xq.jpeg;200
Fresh Prints;lin_Fresh_Prints_1743587369_kBYUGhYLtb.jpeg;500
Celigo;lin_Celigo_1741342563_NInT0c3mVr.jpeg;689
Nokia;lin_Nokia_1747056752_WzWQxrTRjL.jpeg;10001
SonicWall;lin_SonicWall_1744210399_fWzNBLvRB8.jpeg;5000
Reputation;lin_Reputation_1745212463_H4kVWHEn9V.jpeg;1000
KreditBee;lin_KreditBee_1741871165_ZZ3VOL9eHr.jpeg;5000
LogiNext;lin_LogiNext_1739458071_RpQ972hnYh.jpeg;500
JumpCloud;lin_JumpCloud_1739453485_9Oom17faJu.jpeg;1000
MoEngage;lin_MoEngage_1739457945_DqYaJnzddb.jpeg;1000
Attentive.ai;lin_Attentive_ai_1739291090_bBJd9dU7al.jpeg;500
Wishlink;lin_Wishlink_1739291267_qKkcJETx5A.jpeg;200
Fynd (Shopsense Retail Technologies Ltd.);lin_Fynd__Shopsense_Retail_Technologies_Ltd___1739192055_ZP3NpnTKXb.jpeg;1000
NymCard;lin_NymCard_1765889853_VELyJNF4Sc.jpeg;500
Weekday (YC W21);lin_Weekday__YC_W21__1743603514_Knk41FNQpv.jpeg;50
InfraCloud Technologies Pvt Ltd;45931752659073.png;500
udChalo;lin_udChalo_1740750691_zZ1555Ywen.jpeg;500
myHQ by ANAROCK;lin_myHQ_by_ANAROCK_1740751113_Iv08JCjPZg.jpeg;200
Kore.ai;lin_Kore_ai_1742893817_pTLyR9R3Wn.jpeg;1000
Vivanti Consulting;35391760513515.png;200
Kickdrum;lin_Kickdrum_1739192314_DU4eOw8Esv.jpeg;200
TechBlocks;lin_TechBlocks_1739191956_Jbr3j7hB7C.jpeg;1000
"FourKites, Inc.";lin_FourKites__Inc__1740398585_lkGB7hHiTc.jpeg;1000
Cimpress India;lin_Cimpress_India_1746793497_jVnBkKOAOr.jpeg;5000
Acko;lin_Acko_1742379175_Ty1uAEaNRA.jpeg;5000
TechMojo Solutions;lin_TechMojo_Solutions_1766050128_sKo3FX6P31.jpeg;1
Drip Capital;lin_Drip_Capital_1741811941_ojY24yvkQ4.jpeg;500
Easyship;lin_Easyship_1739075254_wrVDKo6UkM.jpeg;200
Vertiv;lin_Vertiv_1747204656_Goid9DJR2v.jpeg;10001
Openprovider;lin_Openprovider_1758873766_rQWK69OKHQ.jpeg;200
AgroStar;lin_AgroStar_1740652828_BtOZF5pEP3.jpeg;5000
Logitech;lin_Logitech_1741343513_2HUqXAo8BO.jpeg;7693
QueueBuster POS;lin_QueueBuster_POS_1741339639_E1jCud4TLS.jpeg;110
itsacheckmate;lin_itsacheckmate_1741340588_3XT87qDynt.jpeg;500
CoinDCX;lin_CoinDCX_1741847137_iiaBVFK55u.jpeg;1000
Q2;lin_Q2_1739191251_V728daE6gt.jpeg;5000
Neotas;lin_Neotas_1740751062_gpGB7CGjLa.jpeg;200
ScaleReal Technologies Pvt. Ltd.;lin_ScaleReal_Technologies_Pvt__Ltd__1766741894_VDqaQBkt8M.jpeg;50
Myntra;87271728555325.png;5000
Snowflake;lin_Snowflake_1747408642_pjVWXP8ve3.jpeg;10000
Cloudera;lin_Cloudera_1739191559_21aDi5BGPH.jpeg;5000
NNE;lin_NNE_1767267106_jUlvzPFU8Z.jpeg;5
Commutatus;lin_Commutatus_1740658344_D9dEmPbTe6.jpeg;50
Microsoft Inc.;lin_Microsoft_Inc__1741341145_CJrPrJ0eqD.jpeg;171000
Digit88 Technologies;lin_Digit88_Technologies_1767591025_sf0YDnkLHI.jpeg;200
BlueOptima;lin_BlueOptima_1744102374_h3TFmztm8j.jpeg;500
Winmore;23241762751675.png;68
1Lattice;lin_1Lattice_1739458094_JpNsetHVT1.jpeg;200
TNQTech;lin_TNQTech_1739543044_ofyNyeoTPd.jpeg;5000
Talkdesk;lin_Talkdesk_1743587316_bMj74LCpky.jpeg;5000
Deeplight AI;lin_Deeplight_AI_1766990230_PaoyCbOW6I.jpeg;200
Progress;lin_Progress_1741325552_NfEbhIktpj.jpeg;5000
Tamara;lin_Tamara_1745851978_7R4Yh4bTMu.jpeg;1000
Nium;lin_Nium_1740653774_pFCYwTZXcY.jpeg;1000
Bazaarvoice;23851730112040.png;1930
HERE Technologies;lin_HERE_Technologies_1746776110_sPKlvDRbD7.jpeg;10000
Navan;lin_Navan_1734440019_GFiNsWtKK2.jpeg;5000
Rolls-Royce;lin_Rolls_Royce_1744124131_ps8Ve7U5v5.jpeg;10001
Atlassian;lin_Personal_Finance_with_Ruchir_1741343919_sKbbtmp0Tj.jpeg;10000
Keka HR;lin_Keka_HR_1739192031_xUdRcF53qI.jpeg;1000
SingleStore;lin_SingleStore_1733174310_DZY2tWK0PN.jpeg;500
Nagarro;lin_Nagarro_1741342518_Mk7BFc9ivp.jpeg;20000
Nike;lin_Nike_1744037635_HJarnd8TZz.jpeg;10001
Innovaccer;lin_Innovaccer_1734440219_rHu2JPT0JM.jpeg;5000
Certa.ai;lin_Certa_ai_1770628614_atB54PEtTq.jpeg;500
MobiKwik;lin_MobiKwik_1746775139_cGBe3DORfi.jpeg;1000
Fiddler Labs Inc;34511728547956.png;200
dLocal;lin_dLocal_1745851799_BMPUujm9sl.jpeg;1000
Yahoo;lin_Yahoo_1739191527_M3im1DdUSA.jpeg;10000
Mastercard;lin_Mastercard_1741787232_YrtGJiCJIn.jpeg;10001
Zoom;lin_Zoom_1753280961_moDhzfkZGZ.jpeg;10000
LiveRamp;lin_LiveRamp_1739191370_eoMSyBnzDq.jpeg;1000
Forbes Advisor;lin_Forbes_Advisor_1739542150_NvZJHE2OLJ.jpeg;500
Arista Networks;lin_Arista_Networks_1744294279_AGv5492ges.jpeg;5000
Birdeye;lin_Birdeye_1743177051_3z8T5CIDKm.jpeg;5000
LinkedIn;lin_LinkedIn_1740395780_BKQncWa24t.jpeg;10001
Blitz;lin_Blitz_1741813528_fEV7T6bVSx.jpeg;200
Midoffice Data;lin_Midoffice_Data_1753439452_S3yoJ1hWRi.jpeg;50
Quizizz;lin_Quizizz_1739454181_67RjzD66B0.jpeg;500
Trading Technologies;lin_Trading_Technologies_1746777014_2MOgcUlcJE.jpeg;500
Chubb;lin_Chubb_1747056739_Fv1VucCDQD.jpeg;10001
Cognyte;lin_Cognyte_1740550743_fkynX44REP.jpeg;5000
Anthology Inc;lin_Anthology_Inc_1741325295_p6ffRAGazY.jpeg;5000
Educational Initiatives;lin_Educational_Initiatives_1746789891_zMvLb0oDVX.jpeg;500
New Relic;lin_New_Relic_1741344800_FEQhYUMmyG.jpeg;2492
Condé Nast;lin_Cond___Nast_1739356101_QOks053JxL.jpeg;5000
Intel Corporation;lin_Intel_Corporation_1739190983_DTepb378ja.jpeg;10001
Palo;lin_Palo_1763035056_3Bleuw1lAy.jpeg;19103
ByteDance;lin_ByteDance_1767266071_TPJAzMsP8P.jpeg;10
Delightree;28091772167835.png;40
Habuild;lin_Habuild_1747911611_aJnXIzMbfC.jpeg;500
Pluang;lin_Pluang_1768370271_dZMacihzMm.jpeg;500
Mihup.ai;lin_Mihup_ai_1740751025_D7CvfRdDgO.jpeg;200
Skit.ai;49481767707572.jfif;207
Fractal;lin_Fractal_1742197742_TlxGzRKnTq.jpeg;5000
Equinix;lin_Equinix_1744210333_CCyhOGnt1i.jpeg;10001
Elsevier;lin_Elsevier_1744037608_6r6EhxATJO.jpeg;10000
Saarthee;lin_Saarthee_1739191990_XZA8SRqhy6.jpeg;200
NucleusTeq;lin_NucleusTeq_1753280574_VqREQWe3wg.jpeg;500
GoTo Group;lin_GoTo_Group_1743676865_oHfDSas3oT.jpeg;10001
AstraZeneca;lin_AstraZeneca_1744037552_rQQspQNfjp.jpeg;10001
Urban Company;lin_Urban_Company_1740565820_3a0lPBajXe.jpeg;5000
9NEXUS;lin_9NEXUS_1768649964_rTLLaBwJr1.jpeg;200
Adobe;82371728548771.png;42603
Rubrik;lin_Rubrik_1734440066_Nevcg9SlnL.jpeg;5000
Smarsh;lin_Smarsh_1744783512_jbyQZqPCOc.jpeg;5000
Baker Hughes;lin_Baker_Hughes_1743585028_OkAkNiH9bR.jpeg;10001
Equifax India;lin_Equifax_India_1743585275_Cex3TdzwiA.jpeg;500
Arrow Electronics;lin_Arrow_Electronics_1739191582_w1WCLBXa1v.jpeg;10001
Perfios;lin_Perfios_1741860928_5j4ri16NB2.jpeg;5000
Capco;lin_Capco_1747389396_plGRAJ9maN.jpeg;10000
Autonomize AI;lin_Autonomize_AI_1740750890_OcW3zeCzPp.jpeg;50
Nivoda;lin_Nivoda_1740391460_hdnGPGcFdz.jpeg;500
Lyzr;49681768980157.png;77
Unilog;lin_Unilog_1746774708_QjS9rvoBI3.jpeg;1000
Everbridge;lin_Everbridge_1744814658_1IHsPd6ozs.jpeg;5000
PhaseZero.ai;lin_PhaseZero_ai_1768896295_fEgX094JoY.jpeg;200
CloudBees;lin_CloudBees_1745212290_k8JY5g3SG7.jpeg;1000
Mindtickle;lin_Mindtickle_1742992173_tuRM0Dm1Ll.jpeg;1000
GoKwik;lin_GoKwik_1739291388_7zI73PlvYJ.jpeg;500
Trellix;lin_Trellix_1739191443_hhuHKHb7xb.jpeg;5000
Amazon;lin_Amazon_1741670726_adqeMKnWV7.jpeg;10001
interface.ai;lin_interface_ai_1739075398_Wn5wus6RBz.jpeg;200
Netomi;lin_Netomi_1744607774_7k9NJVxau4.jpeg;200
Syniti;lin_Syniti_1747906879_ZUHk5LJTzx.jpeg;5000
Revefi;lin_Revefi_1743677079_WAlu4Hyg13.jpeg;50
CLOUDSUFI;cloudsufi_logo-54561739685801.jpg;200
Roku;lin_Roku_1734440131_Bekpg65evD.jpeg;5000
Five9;lin_Five9_1743587511_SDQNsaidRi.jpeg;5000
Sporty Group;lin_Sporty_Group_1739453999_RnITmlGM8g.jpeg;1000
JustAnswer;lin_JustAnswer_1743587210_3WVmUKE1hE.jpeg;1000
Skyflow;lin_Skyflow_1740390920_S8FAPN8Rkn.jpeg;200
IDFC FIRST Bank;lin_IDFC_FIRST_Bank_1766220976_dhgF94Mwn5.jpeg;10
First Advantage;lin_First_Advantage_1769150932_8QUTkF0gEU.jpeg;10
Shipsy;lin_Shipsy_1739542097_zVPVGwrC9T.jpeg;500
NewSpace Research and Technologies;lin_NewSpace_Research_and_Technologies_1739291281_JEVMrnTEIM.jpeg;500
Kenvue;lin_Kenvue_1748358193_JYZGm2C6Kj.jpeg;10001
Credit Karma;lin_Credit_Karma_1769263378_kuSeeRnhzH.jpeg;10
Betterworks;lin_Betterworks_1747732674_SWzXxMC6iB.jpeg;200
Arctic Wolf;lin_Arctic_Wolf_1747922923_WnDb98VYjI.jpeg;5000
UiPath;lin_UiPath_1746793842_hDvQXdML2e.jpeg;5000
UNIQODE;lin_UNIQODE_1746773981_PeOTeWy7mP.jpeg;200
Alaan;lin_Alaan_1742893674_WeG3UjBHx5.jpeg;200
Lucidity;lin_Lucidity_1745851042_8uk5k1Obk6.jpeg;200
Dialpad;lin_Dialpad_1744607411_aZwHOsX2a7.jpeg;5000
Daxko;lin_Daxko_1739542130_eN35cCuFfW.jpeg;1000
Cowbell;lin_Cowbell_1747925448_VI0niGLtB1.jpeg;200
FuturePath AI;lin_FuturePath_AI_1757397747_yznxeAipyx.jpeg;200
Tazapay;lin_Tazapay_1739759065_gC2dz5oaZa.jpeg;200
Morningstar;lin_Morningstar_1743584769_UGBtL5QUd7.jpeg;10001
Yularatech;lin_Yularatech_1769546948_H14nMJ7cVE.jpeg;200
Boeing;lin_Boeing_1743683084_5CNhqVHrMS.jpeg;10001
Super.Money;lin_super_money_1747395618_RLUwOFzOUQ.jpeg;97
Unified Infotech;lin_Unified_Infotech_1769582280_dE7NzlfRaD.jpeg;500
alphastream.ai;lin_alphastream_ai_1769582347_DbDpjlP1YO.jpeg;200
Olyv India (formerly SmartCoin);lin_Olyv_India__formerly_SmartCoin__1741607291_HKBiA2sU9e.jpeg;200
Takeda;lin_Takeda_1744037434_hzvr7ANl22.jpeg;10001
Duck Creek Technologies;lin_Duck_Creek_Technologies_1740410483_sanNl3Rdeo.jpeg;5000
WNS;lin_WNS_1740653852_tVtTzCDV84.jpeg;10001
Curriculum Associates;lin_Curriculum_Associates_1739191616_4vw57scJR3.jpeg;5000
Red Hat;24041728555180.png;19298
RAIS USA;lin_RAIS_USA_1769612427_23W1nimnog.jpeg;50
Capital One;lin_Capital_One_1741869186_QHlfGZdm57.jpeg;10001
Think Future Technologies;lin_Think_Future_Technologies_1733493938_d2l0VeIsIR.jpeg;500
Apptware;lin_Apptware_1769713578_PkeLgDfUPH.jpeg;200
Vyntelligence;lin_Vyntelligence_1747926219_p4Cg2WwPL6.jpeg;50
Entrupy;lin_entrupy_com_1747393755_lrdlbnl9Gj.jpeg;56
A.P. Moller - Maersk;lin_A_P__Moller___Maersk_1769498764_gmyqW0I2YA.jpeg;10
Carousell Group;lin_Carousell_Group_1745850966_r8OYFYJYXG.jpeg;1000
Egen;lin_Egen_1744294542_MKyrktfw46.jpeg;1000
Atyeti Inc;lin_Atyeti_Inc_1769582667_P0Uim8T6RO.jpeg;1
Hitachi Digital Services;lin_Hitachi_Digital_Services_1734440200_UoNGXm83ZY.jpeg;10000
Intellias;lin_Intellias_1764911890_OHe49Vktxn.jpeg;5
Mesh;lin_Mesh_1769932095_ZWye8ZFMqq.jpeg;200
Qinecsa Solutions;lin_Qinecsa_Solutions_1769968703_0FWgphzDrQ.jpeg;5
Fabric Group;lin_Fabric_Group_1769968750_tjE2i6at92.jpeg;200
Globant;58301728549217.png;28505
Endava;lin_Endava_1770040294_oQ3bkHA6u4.jpeg;10
AiStrike;lin_AiStrike_1770040366_Ed7D5RaQig.jpeg;50
Bajaj Finserv;lin_Bajaj_Finserv_1739356091_K32EvQjFwx.jpeg;10001
Sigmoid;lin_Sigmoid_1734440010_7G7HXEsQ60.jpeg;1000
BairesDev;lin_BairesDev_1764143072_8vT2isTKG7.jpeg;5
GHX;lin_GHX_1738233081_NO5SZySGht.jpeg;5000
Nurix;lin_Nurix_1742991919_xPT01ktML7.jpeg;50
IntegriChain;lin_IntegriChain_1744210470_mhd2RKLj5p.jpeg;1000
bp;lin_bp_1744037288_5QOowlg780.jpeg;10001
DBiz.ai;lin_DBiz_ai_1770119340_N4kvUpVddp.jpeg;1
Redica Systems;lin_Redica_Systems_1745851507_vpEB6VHzVy.jpeg;200
PayPal;lin_PayPal_1740565747_TqFpxHwSJP.jpeg;10001
Hyqoo;lin_Hyqoo_1769757854_7nTUMlBL9q.jpeg;200
DeepIntent;lin_DeepIntent_1738825982_KtH1Vz1IXQ.jpeg;500
AgileEngine;lin_AgileEngine_1770180601_cCY1cQjWpZ.jpeg;5
Airbus;lin_Airbus_1739190972_qGPYlu0dIL.jpeg;10001
MWIDM;lin_MWIDM_1770185305_9tuNmzwBGQ.jpeg;1
"GSPANN Technologies, Inc";lin_GSPANN_Technologies__Inc_1769060571_hTyfY0C6dp.jpeg;5
Schneider Electric;lin_Schneider_Electric_1747891050_WHuLGkE2lJ.jpeg;10001
Jumio Corporation;lin_Jumio_Corporation_1745850952_NSkrXie7iU.jpeg;500
Digile;lin_Digile_1768848506_rMvoz71Z0k.jpeg;1
Accrete;lin_Accrete_1741327308_MIhSJoCbT0.jpeg;200
BrowserStack;62461751353170.jpeg;1115
Danfoss;lin_Danfoss_1770275226_rJSvXgetpe.jpeg;10
MiQ;lin_MiQ_1746789983_8RN2pvYPPH.jpeg;1000
Firstsource;lin_Firstsource_1746797347_KllfCrW9Ii.jpeg;10001
ServiceNow;lin_ServiceNow_1742525592_s8Pl886vjy.jpeg;10001
Quantiphi;lin_Quantiphi_1740654026_xBq0iQUjzo.jpeg;5000
Pocket FM;82211728549022.png;1000
InMobi;lin_InMobi_1741780234_yzLsFPeU9y.jpeg;5000
Harness;lin_Harness_1739075324_gFQPMprQwt.jpeg;1000
LogicMonitor;lin_LogicMonitor_1744607669_Dm8WqKrteS.jpeg;5000
ElevenLabs;lin_ElevenLabs_1745212389_heCH43HeDE.jpeg;200
GlobalLogic;lin_GlobalLogic_1747906449_9lli8LQomn.jpeg;10001
Harris Computer;lin_Harris_Computer_1744124097_1GQGKiAcha.jpeg;10001
Modulr;lin_Modulr_1770818464_UApGWHLha4.jpeg;500
Light & Wonder;lin_Light___Wonder_1743585711_eOjMYHeXBO.jpeg;10000
Scallop | E Money Network;lin_Scallop___E_Money_Network_1770902650_sVbOBHHtOb.jpeg;50
American Express Global Business Travel;lin_American_Express_Global_Business_Travel_1739191469_N66c7T3BPE.jpeg;10001
BlackRock;lin_BlackRock_1743683612_n7YG0Baqko.jpeg;10001
Lyra Health;lin_Lyra_Health_1747922936_iGBjWA8TUN.jpeg;5000
M32 AI;lin_M32_AI_1770990308_wilHr9mCh4.jpeg;10
Zorba AI;lin_Zorba_AI_1770993716_4VOUxf4GYF.jpeg;50
Sprinklr;lin_Sprinklr_1739191505_FTZ6jESC9H.jpeg;5000
Impact Analytics;lin_Impact_Analytics_1771053433_a2aFOJd036.jpeg;1
Infinite Uptime;lin_Infinite_Uptime_1742991847_TLlNKEam5h.jpeg;500
Virtusa;lin_Virtusa_1771079775_ztCueXMRB5.jpeg;10
loopio;54511728555300.png;500
GoML;lin_GoML_1770180590_7gEB4Aeubt.jpeg;200
LambdaTest;lin_LambdaTest_1742991819_mzkdlSmKCU.jpeg;500
Clari;lin_Clari_1744783437_x9vEp37lTa.jpeg;1000
Hireginie;lin_Hireginie_1768649391_Zwso0Y1yFC.jpeg;50
NVIDIA;lin_NVIDIA_1739191240_xrKxP8yyX4.jpeg;10001
Pi42;lin_Pi42_1771236738_VCKuyg26MH.jpeg;200
Vonage;lin_Vonage_1745851340_OcjyYPrbla.jpeg;5000
Glomo;lin_Glomo_1747915078_JkYIXN5QVK.jpeg;50
i-exceed;lin_i_exceed_1771250115_XymAYgb7RY.jpeg;1
Redpin;lin_Redpin_1771252439_ueNGQuT0yl.jpeg;1
Zingtree;lin_Zingtree_1744123678_gobyCoVwe5.jpeg;200
Sabre Corporation;lin_Sabre_Corporation_1743680080_EXNpZS76cv.jpeg;10000
Prophecy;lin_Prophecy_1743587222_wN3i6oLsqN.jpeg;200
Motive;lin_Motive_1740398682_Y0XNd4dmhb.jpeg;5000
Ezeiatech;lin_Ezeiatech_1771322258_XsUoLTXyeM.jpeg;200
Stackera Inc.;lin_Stackera_Inc__1771322310_LyFuzdUR8N.jpeg;50
KredX;51481728555163.png;166
intuit.com;lin_intuit_com_1758096345_2leMd9VKYx.jpeg;5000
Parspec;lin_Parspec_1740390768_ROL4z3R4p6.jpeg;50
JPMorgan Chase & Co.;lin_JPMorgan_Chase___Co__1741340696_VHVGsY0SJO.jpeg;223214
Solventum;lin_Solventum_1744037468_sNIUmUrI40.jpeg;10001
Ciena;lin_Ciena_1746794521_JvCkjbu1G2.jpeg;10000
Smarter Dharma;lin_smarterdharma_com_1747395029_xQPam5LvC8.png;20
Vendavo;lin_Vendavo_1745851279_zV4nHfoCWH.jpeg;500
RemoFirst;68481772111538.png;500
"Lytx, Inc.";lytxinc_logo-91701736486563.jpg;1058
Signify;lin_Signify_1744209612_p2p4U3PKKe.jpeg;10001
NEOGOV;lin_NEOGOV_1747925362_RAY54OZFcb.jpeg;1000
Qure.ai;lin_Qure_ai_1739356179_MeO1h30io9.jpeg;200
Airbnb;91211728547572.png;6000
Flexport;lin_Flexport_1739075306_RUxyji7peV.jpeg;5000
nVent;lin_nVent_1744783763_UT9ifUgV9p.jpeg;10001
HiLabs;lin_HiLabs_1734440125_zkhYAn57WR.jpeg;200
State Street;lin_State_Street_1739191035_Y4Ejl8ZT3y.jpeg;10001
Credera;lin_Credera_1739538175_tmARkOQdRu.jpeg;5000
Josys;lin_Josys_1740390824_edeqTwRq0b.jpeg;200
Acquia;lin_Acquia_1739355141_hZ0aEQTSfl.jpeg;5000
Nexthink Inc;74561728548275.png;5000
Johnson Controls;lin_Johnson_Controls_1743683195_ybA4vLWng5.jpeg;10001
Quantumloopai;lin_Quantumloopai_1747899910_3BjEzWYFsR.jpeg;200
BitGo;lin_BitGo_1739075146_qcAK4ev1wM.jpeg;500
Sanofi;lin_Sanofi_1744037322_kaNQuibgSk.jpeg;10001
Streamhub;lin_Streamhub_1741327168_ptRu6J6q83.jpeg;50
Thinkgrid Labs;lin_Thinkgrid_Labs_1741344218_57uFE3D2Cb.jpeg;6
Wells Fargo;lin_Wells_Fargo_1740410497_O3uXsvevN2.jpeg;10001
"Vymo, Inc.";lin_Vymo__Inc__1739543118_Gkczyn36qz.jpeg;1000
CloudHire;lin_CloudHire_1733460186_NKj4sKWuEg.jpeg;50
ThoughtSpot;lin_ThoughtSpot_1740410522_uG8llUakBe.jpeg;1000
Moonfrog Labs;lin_Moonfrog_Labs_1746775942_DO9jptfWsv.jpeg;200
MSD;lin_MSD_1746775213_PcQQpqt0v7.jpeg;10001
Trimble Inc.;lin_Trimble_Inc__1743594573_fD8lmnOlt8.jpeg;10001
Sutra;lin_sutra_ai_1747397910_95PdwqAjYd.jpeg;200
Velsera;lin_Velsera_1733856396_J5TtJsztTC.jpeg;1000
Albert Invent;91511771419752.png;172
LeadVenture®;lin_LeadVenture___1745851502_WU7fUYpCDk.jpeg;5000
Weave;lin_Weave_1740390861_5v1uPr6gUk.jpeg;1000
EvoluteIQ;lin_EvoluteIQ_1746791958_Yyxziwt9kl.jpeg;200
Turno;lin_Turno_1740653690_Oo4Z9malAM.jpeg;200
Fello;lin_Fello_1742893551_JbZhSzIPCX.jpeg;200
Rippling;lin_Rippling_1742893966_yRMITXK6Mz.jpeg;5000
JFrog;lin_JFrog_1734440203_N327UMnOC1.jpeg;5000
Corelight;lin_Corelight_1745850983_mnATtI9AvA.jpeg;500
Avegen;lin_Avegen_1740750698_d8s1qRGw1M.jpeg;200
Pocketpills;lin_Pocketpills_1743512011_xcVIUOEnLp.jpeg;500
Fivetran;lin_Fivetran_1733493927_Msi8PhfjH7.jpeg;5000
ClickPost;ClickPost_Logo-24931746014259.jpeg;145
Experience.com;lin_Experience_com_1745851218_kxDaNwqU1T.jpeg;500
Lean Technologies;lin_Lean_Technologies_1740390736_ZblUDuzsq6.jpeg;200
Zeta;lin_Zeta_1739453695_54XMrYMfEt.jpeg;5000
Grid Dynamics;lin_Grid_Dynamics_1746794048_9LPp1Ck1jx.jpeg;5000
CheQ;lin_CheQ_1738930946_ZDbV2d0vgq.jpeg;200`;

function parseCSVLine(line) {
    const parts = line.split(";");
    if (parts.length < 3) return null;
    const name = (parts[0] || "").replace(/^"|"$/g, "").trim();
    const logo = (parts[1] || "").trim().replace(/\s+/g, " ");
    const maxEmp = parseInt(parts[2], 10);
    if (!name || !logo || isNaN(maxEmp)) return null;
    return { name, logo, maxEmp };
}

function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function getReferralCompaniesGrouped() {
    const lines = REFERRAL_COMPANIES_CSV.trim().split("\n");
    const companies = lines.map(parseCSVLine).filter(Boolean);
    const small = [];
    const mid = [];
    const large = [];
    const enterprise = [];
    companies.forEach((c) => {
        if (c.maxEmp <= 500) small.push(c);
        else if (c.maxEmp <= 5000) mid.push(c);
        else if (c.maxEmp <= 10000) large.push(c);
        else enterprise.push(c);
    });
    return [
        { id: "enterprise", label: "Enterprise (10,001+ employees)", companies: enterprise },
        { id: "large", label: "Large (5,001 – 10,000)", companies: large },
        { id: "mid", label: "Mid-size (501 – 5,000)", companies: mid },
        { id: "small", label: "Startups & small (1 – 500)", companies: small },
    ];
}

/** Returns same structure but each group has a random sample of up to maxPerGroup companies (for display), plus totalCount. */
export function getReferralCompaniesGroupedSample(maxPerGroup = 10) {
    const full = getReferralCompaniesGrouped();
    return full.map((g) => ({
        ...g,
        companies: shuffleArray(g.companies).slice(0, maxPerGroup),
        totalCount: g.companies.length,
    }));
}


// Intervue.io;lin_Intervue_io_1746792168_0VDFRecq3z.jpeg;200