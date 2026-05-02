import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BotForm } from '../components/BotForm';

export function NewBotPage({ mcpServices, onCreate }) {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (formData) => {
    setSubmitting(true);
    try {
      await onCreate(formData);
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = () => {
    navigate('/');
  };

  return <BotForm mcpServices={mcpServices} onSubmit={handleCreate} submitting={submitting} onComplete={handleComplete} />;
}
