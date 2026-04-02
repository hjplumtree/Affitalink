import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { isEmpty } from "../lib/validate";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";

export default function NetworkInput({
  networkName,
  auth,
  setAuth,
  fetchAdvertiserList,
  deleteDB,
  connectorStatus,
  helperText,
  actionLabel = "Save and test",
}) {
  const [show, setShow] = useState(false);
  const [inputError, setInputError] = useState(false);

  const handleInputChange = (e) => {
    setAuth((prevState) => {
      const newState = { ...prevState };
      newState[e.target.dataset.name] = e.target.value;
      return newState;
    });
  };

  const inputs = Object.entries(auth);

  const handleConnect = () => {
    if (isEmpty(inputs)) {
      setInputError(false);
      fetchAdvertiserList();
    } else {
      setInputError(true);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Delete the saved settings for ${networkName}?`)) {
      deleteDB();
    }
  };

  return (
    <Card className="border-white/60 bg-white/95">
      <CardHeader className="space-y-4">
        <Badge className="w-fit">Source settings</Badge>
        <div>
          <CardTitle>{networkName}</CardTitle>
          <CardDescription className="mt-2 text-base leading-7">
            {helperText || `Enter credentials to connect ${networkName}.`}
          </CardDescription>
        </div>
        <p className="text-sm text-muted-foreground">
          Save the credentials, test the connection, then choose merchants below.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {inputs.map((input) => (
          <div key={input[0]} className="space-y-2">
            <label htmlFor={input[0]} className="text-sm font-semibold text-foreground">
              {input[0].split("_").join(" ").toUpperCase()}
            </label>
            {input[0] === "token" ? (
              <div className="relative">
                <Input
                  id={input[0]}
                  onChange={handleInputChange}
                  type={show ? "text" : "password"}
                  placeholder="Paste token"
                  value={auth.token}
                  data-name="token"
                  className="pr-14"
                />
                <button
                  type="button"
                  onClick={() => setShow((current) => !current)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  aria-label={show ? "Hide token" : "Show token"}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            ) : (
              <Input
                id={input[0]}
                onChange={handleInputChange}
                type="text"
                placeholder={`Paste ${input[0].split("_").join(" ")}`}
                value={auth[input[0]]}
                data-name={input[0]}
              />
            )}
          </div>
        ))}

        {inputError ? (
          <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Fill in every field, then try again.
          </div>
        ) : null}

        {connectorStatus ? (
          <div
            className={`rounded-[20px] px-4 py-3 text-sm ${
              connectorStatus.status === "connected"
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-amber-200 bg-amber-50 text-amber-800"
            }`}
          >
            {connectorStatus.message}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 md:flex-row">
          <Button type="button" onClick={handleConnect} className="md:flex-1">
            {actionLabel}
          </Button>
          <Button type="button" variant="outline" onClick={handleDelete} className="md:flex-1">
            Delete source
          </Button>
        </div>

        <div className="rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          Credentials are stored on the backend so manual sync can run on the server. Remove them when you no longer want this source feeding the queue.
        </div>
      </CardContent>
    </Card>
  );
}
