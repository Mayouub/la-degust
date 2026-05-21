import {
  Html,
  Head,
  Body,
  Preview,
  Container,
  Section,
  Text,
  Link,
  Hr,
  Img,
} from "@react-email/components";

type Props = {
  customerName: string;
  partySize: number;
  reservationDate: string;   // ex. "Samedi 23 juin 2026"
  reservationTime: string;   // ex. "12:30"
  serviceName: string;
  confirmationNumber: string; // 8 premiers chars du public_token
  cancelUrl: string;
};

const MARINE = "#1B3A5B";
const BEURRE = "#FAF4A6";
const SABLE = "#F4EEDD";
const ENCRE = "#0F1A2B";

export default function ReservationConfirmation({
  customerName,
  partySize,
  reservationDate,
  reservationTime,
  serviceName,
  confirmationNumber,
  cancelUrl,
}: Props) {
  return (
    <Html lang="fr">
      <Head />
      <Preview>
        Réservation confirmée · {reservationDate} à {reservationTime}
      </Preview>
      <Body style={{ backgroundColor: SABLE, fontFamily: "Georgia, serif", margin: 0, padding: 0 }}>
        {/* Header */}
        <Section style={{ backgroundColor: MARINE, padding: "32px 0", textAlign: "center" }}>
          <Text
            style={{
              color: BEURRE,
              fontSize: "22px",
              fontWeight: "bold",
              margin: 0,
              letterSpacing: "0.05em",
            }}
          >
            La Dégust' du Grand Coin
          </Text>
          <Text style={{ color: BEURRE, opacity: 0.7, fontSize: "13px", margin: "4px 0 0" }}>
            Ostréiculteur depuis 1987
          </Text>
        </Section>

        {/* Body */}
        <Container style={{ maxWidth: "560px", margin: "0 auto", padding: "0 16px 40px" }}>
          <Section style={{ backgroundColor: "#fff", borderRadius: "8px", padding: "32px", marginTop: "24px" }}>
            <Text style={{ color: MARINE, fontSize: "20px", fontWeight: "bold", margin: "0 0 8px" }}>
              Réservation confirmée ✓
            </Text>
            <Text style={{ color: ENCRE, fontSize: "16px", margin: "0 0 24px" }}>
              Bonjour {customerName},
            </Text>
            <Text style={{ color: ENCRE, fontSize: "15px", margin: "0 0 24px", lineHeight: "1.6" }}>
              Votre réservation est bien enregistrée. Nous avons hâte de vous accueillir !
            </Text>

            {/* Récapitulatif */}
            <Section
              style={{
                backgroundColor: SABLE,
                borderRadius: "6px",
                padding: "20px 24px",
                marginBottom: "24px",
              }}
            >
              <Row label="Date" value={reservationDate} />
              <Row label="Heure" value={reservationTime} />
              <Row label="Service" value={serviceName} />
              <Row label="Couverts" value={`${partySize} personne${partySize > 1 ? "s" : ""}`} />
              <Hr style={{ borderColor: "#ddd", margin: "12px 0" }} />
              <Row label="N° de confirmation" value={confirmationNumber} bold />
            </Section>

            <Text style={{ color: "#666", fontSize: "13px", lineHeight: "1.6", margin: "0 0 24px" }}>
              Vous recevrez un rappel la veille de votre réservation.
              En cas d'empêchement, merci de nous prévenir au moins 24h à l'avance.
            </Text>

            {/* Lien annulation */}
            <Link
              href={cancelUrl}
              style={{
                color: MARINE,
                fontSize: "13px",
                textDecoration: "underline",
              }}
            >
              Annuler ma réservation
            </Link>
          </Section>

          {/* Footer */}
          <Text
            style={{
              color: "#888",
              fontSize: "12px",
              textAlign: "center",
              marginTop: "24px",
              lineHeight: "1.6",
            }}
          >
            La Dégust' du Grand Coin · 85 Rue du Grand Coin · 85550 La Barre-de-Monts
            <br />
            Tél. 02 51 68 XX XX · contact@ladegustdugrandcoin.fr
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

function Row({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <Section style={{ display: "flex", justifyContent: "space-between", margin: "4px 0" }}>
      <Text style={{ color: "#666", fontSize: "13px", margin: 0, display: "inline" }}>{label}</Text>
      <Text
        style={{
          color: ENCRE,
          fontSize: "14px",
          margin: 0,
          display: "inline",
          fontWeight: bold ? "bold" : "normal",
        }}
      >
        {value}
      </Text>
    </Section>
  );
}
