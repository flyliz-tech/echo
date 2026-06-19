import type { Href, Router } from "expo-router";

export function openTask(router: Router, taskId: string) {
  router.navigate(`/task/${taskId}` as Href);
}

export function openTaskEdit(router: Router, taskId: string) {
  router.navigate(`/task/${taskId}/edit` as Href);
}

export function goBackOrHome(router: Router) {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace("/(tabs)");
}
