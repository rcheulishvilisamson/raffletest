export default function WhyJoin() {
  const reasons = [
    {
      icon: '🎯',
      title: 'Provably Fair Draws',
      description: 'Every draw is transparent with published proof and seed verification.',
    },
    {
      icon: '💸',
      title: 'Refunds Guaranteed',
      description: 'If a raffle doesn\'t complete, your tickets are automatically refunded.',
    },
    {
      icon: '🙌',
      title: 'Community-Powered',
      description: 'Join a trusted community of raffles verified and moderated by admins.',
    },
    {
      icon: '🔒',
      title: 'Safe & Verified Hosts',
      description: 'Only KYC-verified hosts can create raffles on our platform.',
    },
  ];

  return (
    <section className="py-20 px-4 bg-light_bg">
      <div className="max-w-7xl mx-auto">
        <h2 className="heading-2 text-center mb-16">Why Join RaffleHub</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reasons.map((reason, index) => (
            <div key={index} className="card">
              <div className="text-4xl mb-4">{reason.icon}</div>
              <h3 className="heading-3 mb-3">{reason.title}</h3>
              <p className="body-text">{reason.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
