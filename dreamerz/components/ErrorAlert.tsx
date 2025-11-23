import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { CircleAlertIcon } from 'lucide-react';

export default function ErrorAlert({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div>
      <Alert variant="destructive">
        <CircleAlertIcon />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>
    </div>
  );
}
