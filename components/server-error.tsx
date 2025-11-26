import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ServerErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function ServerError({ error, reset }: ServerErrorProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Something went wrong!</CardTitle>
          <CardDescription>
            {error.message || "An unexpected error occurred"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {error.digest && (
            <p className="text-sm text-muted-foreground">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/")}
            >
              Go Home
            </Button>
            <Button onClick={reset}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
