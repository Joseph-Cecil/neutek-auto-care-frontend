import Link from 'next/link';

export function AuthBrand() {
  return (
    <Link href="/home" className="brand" aria-label="Neutek Auto Care home">
      <div className="mark">NT</div>
      <div>
        <div className="b">Neutek</div>
        <div className="faint sm">Auto Care</div>
      </div>
    </Link>
  );
}
