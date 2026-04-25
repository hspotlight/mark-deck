"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Tooltip from "@mui/material/Tooltip";
import { incrementViewCount, incrementDownloadCount } from "@/modules/deck-repository";

interface Props {
  deckId: string;
  pdfUrl?: string | null;
  currentUrl: string;
}

export default function DeckActions({ deckId, pdfUrl, currentUrl }: Props) {
  const didCount = useRef(false);
  const [snackOpen, setSnackOpen] = useState(false);

  // Increment view count once on mount
  useEffect(() => {
    if (didCount.current) return;
    didCount.current = true;
    incrementViewCount(deckId).catch(() => {});
  }, [deckId]);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setSnackOpen(true);
    } catch {
      // fallback: select + execCommand
      const el = document.createElement("textarea");
      el.value = currentUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setSnackOpen(true);
    }
  }

  const tweetText = encodeURIComponent("Check out this deck on mark-deck!");
  const tweetUrl = encodeURIComponent(currentUrl);

  return (
    <>
      <div className="flex flex-wrap gap-3 mt-6">
        {pdfUrl ? (
          <Button
            variant="contained"
            component="a"
            href={pdfUrl}
            download
            onClick={() => incrementDownloadCount(deckId).catch(() => {})}
          >
            Download PDF
          </Button>
        ) : (
          <Tooltip title="PDF not yet available">
            <span>
              <Button variant="contained" disabled>
                Download PDF
              </Button>
            </span>
          </Tooltip>
        )}

        <Button
          variant="outlined"
          component="a"
          href={`https://twitter.com/intent/tweet?url=${tweetUrl}&text=${tweetText}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Share on X
        </Button>

        <Button variant="outlined" onClick={handleCopyLink}>
          Copy link
        </Button>
      </div>

      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        message="Copied!"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </>
  );
}
