import Image from "next/image";
import { cn } from "@/lib/utils";

interface CastMember {
  id: number;
  name: string;
  character?: string;
  job?: string;
  role?: string;
  photo: string | null;
}

interface CastRowProps {
  members: CastMember[];
  title?: string;
  className?: string;
}

export function CastRow({ members, title = "Cast", className }: CastRowProps) {
  if (!members || members.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {members.slice(0, 12).map((member) => (
          <div key={`${member.id}-${member.character ?? member.job ?? member.role}`} className="text-center">
            <div className="relative mx-auto h-16 w-16 rounded-full overflow-hidden bg-muted border border-border mb-2">
              {member.photo ? (
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <span className="text-lg font-bold text-muted-foreground">
                    {member.name.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs font-medium leading-tight truncate">{member.name}</p>
            {(member.character || member.job || member.role) && (
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                {member.character ?? member.job ?? member.role}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
