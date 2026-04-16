interface SigningWidgetProps {
  signingLink: string;
}

export default function SigningWidget({ signingLink }: SigningWidgetProps) {
  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50" style={{ height: '520px' }}>
      <iframe
        src={signingLink}
        className="w-full h-full"
        title="Assinar documento - D4Sign"
        allow="camera; microphone"
      />
    </div>
  );
}
