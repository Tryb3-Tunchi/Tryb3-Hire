import { useEffect } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export function useOnboarding() {
  useEffect(() => {
    const hasSeenTour = localStorage.getItem("tryb3-tour-done");
    if (hasSeenTour) return;

    const driverObj = driver({
      showProgress: true,
      animate: true,
      overlayOpacity: 0.7,
      smoothScroll: true,
      allowClose: true,
      stagePadding: 8,
      stageRadius: 10,
      popoverClass: "tryb3-popover",
      progressText: "{{current}} of {{total}}",
      nextBtnText: "Next →",
      prevBtnText: "← Back",
      doneBtnText: "Let's go",
      onDestroyStarted: () => {
        localStorage.setItem("tryb3-tour-done", "true");
        driverObj.destroy();
      },
      steps: [
        {
          element: "#sidebar-dashboard",
          popover: {
            title: "Command Center",
            description:
              "Your main overview. See all active pipelines, agent status, and system health at a glance.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#sidebar-pipelines",
          popover: {
            title: "Pipelines",
            description:
              "Each pipeline is one hiring request. Six agents work through it autonomously from intake to offer.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#sidebar-candidates",
          popover: {
            title: "Candidates",
            description:
              "All candidates across every pipeline. Each one scored and reasoned about by the Sourcing Agent.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#sidebar-memory",
          popover: {
            title: "Memory Explorer",
            description:
              "The Screening Agent remembers every candidate conversation across sessions. Explore that memory here.",
            side: "right",
            align: "start",
          },
        },
        {
          element: "#new-pipeline-btn",
          popover: {
            title: "Start a hiring request",
            description:
              "Click here to kick off a new pipeline. Paste a job description and the agents take it from there.",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: "#system-health",
          popover: {
            title: "System Health",
            description:
              "Live stats — active agents, Qwen API status, memory nodes, and decisions made this week.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "#pipeline-list",
          popover: {
            title: "Active pipelines",
            description:
              "Click any pipeline card to see the full agent pipeline, reasoning traces, and candidate list.",
            side: "top",
            align: "start",
          },
        },
      ],
    });

    const timer = setTimeout(() => {
      driverObj.drive();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);
}
