export function OgCard({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) {
  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        padding: 64,
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #312e81 0%, #7c3aed 58%, #db2777 100%)',
        color: '#fff',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 28 }}>
        <span>{eyebrow}</span>
        <span style={{ opacity: 0.85 }}>BusQuiz</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.08 }}>{title}</div>
        {description ? (
          <div style={{ fontSize: 30, marginTop: 20, opacity: 0.9, lineHeight: 1.25 }}>
            {description}
          </div>
        ) : null}
      </div>
    </div>
  )
}
