import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BotForm } from '../components/BotForm';

export function NewBotPage({ mcpServices, onCreate }) {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (formData) => {
    setSubmitting(true);
    try {
      const bot = await onCreate(formData);
      navigate(`/bots/${bot.id}`);
    } finally {
      setSubmitting(false);
    }
  };

  return <BotForm mcpServices={mcpServices} onSubmit={handleCreate} submitting={submitting} />;
}
