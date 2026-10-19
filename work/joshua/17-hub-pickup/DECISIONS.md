# Hub Pickup (17-hub-pickup)

Designer: Joshua

## My choice

<!-- A or B. Then 2–3 lines on why, in YOUR OWN words (not the AI's). -->
1. Top part of the page screen is too wordy, decided to decrease the words to reduce the visual overload on the user.
    - Implementation: removed the introductory paragraph, changed the heading into a direct question, and shortened the work-conflict message.

2. Public Rack screen is too wordy; reduced the copy to lower readers’ cognitive load.
    - Implementation: removed repeated rack and return information, shortened supporting labels, and kept each required pickup and return detail once in the main content.

3. Direction B explores a visual rack-selection map to reduce the cognitive effort of deciding which rack is most convenient. Distance alone may not reflect convenience, so the map also makes nearby roads and paths visible.
    - Implementation: carried Direction A’s concise Home Collection and return sections into Direction B, then replaced its text-based Public Rack choice with a quieter vector street map. Each pin contains its rack letter (A, B or C), with details in the list below. View map expands the same map into the phone frame; users can drag, scroll to zoom, or use arrow keys. Pins stay attached to their map positions, and clicking a pin or rack choice updates the return details.

4. Motion should clarify changes without slowing the task.
    - Implementation: both directions use short token-based entrance motion when pickup and return details change, plus a subtle confirmation-button settle. Direction B also stages the map and rack pins when Public Rack opens, then expands the map from its preview position on View map. Movement uses opacity and transforms and is removed when reduced motion is enabled.


## Image requests

<!-- Filled in by your AI: one row per .img-ph placeholder in the version you chose. -->

| Where | What it should show |
|---|---|
| | |

## Notes

<!-- Optional. Anything off-system, questions about the spec, ideas for the team lead. -->

- The spec still says Daniel is at work from 5–7 pm, but the latest clarification says this is an available home collection window. Both directions follow the clarification; the spec needs reconciling.
- Direction B’s custom map artwork and map-only colours are an intentional exception requested for rack selection. The surrounding interface continues to use Trail Glass tokens and components.
- Direction A now uses the shared bottom-sheet pattern and token-based rack rows to select a rack in place, as requested. This replaces the spec’s “Choose a rack” navigation to page 18; Confirm remains because the spec requires a confirmed state.
