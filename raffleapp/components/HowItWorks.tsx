export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Sign Up Free',
      description: 'Create an account in seconds and get ready to join raffles.',
    },
    {
      number: '2',
      title: 'Buy Tickets',
      description: 'Purchase ticket packs with your preferred payment method.',
    },
    {
      number: '3',
      title: 'Join & Win',
      description: 'Spend tickets to enter raffles and watch the fair draw happen.',
    },
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="heading-2 text-center mb-16">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-6 font-title">
                {step.number}
              </div>
              <h3 className="heading-3 mb-3">{step.title}</h3>
              <p className="body-text">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
