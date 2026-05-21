interface Props {
  lat?: number | null;
  lng?: number | null;
  name?: string;
  className?: string;
}

export function GoogleMap({
  lat = 46.674,
  lng = -1.431,
  name = "La Dégust' du Grand Coin",
  className,
}: Props) {
  const q = encodeURIComponent(`${lat ?? 46.674},${lng ?? -1.431}`);
  const src = `https://maps.google.com/maps?q=${q}&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <iframe
      src={src}
      title={`Localisation : ${name}`}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      style={{ border: 0 }}
      allowFullScreen
      aria-label={`Carte Google Maps montrant l'emplacement de ${name}`}
    />
  );
}
