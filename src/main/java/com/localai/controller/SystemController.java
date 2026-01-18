package com.localai.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.lang.management.ManagementFactory;
import java.lang.management.OperatingSystemMXBean;
import java.util.Map;

@RestController
@RequestMapping("/api/system")
public class SystemController {

    @GetMapping("/stats")
    public Map<String, Object> getSystemStats() {
        // RAM Usage
        OperatingSystemMXBean osBean = ManagementFactory.getOperatingSystemMXBean();
        double totalRam = 16.0; // Default estimate if unable to fetch
        double usedRam = 0;
        double ramPercent = 40;

        // Try to cast to com.sun.management.OperatingSystemMXBean for physical memory
        // info
        // This is generic handling; specific impl might vary by JDK
        if (osBean instanceof com.sun.management.OperatingSystemMXBean) {
            com.sun.management.OperatingSystemMXBean sunOsBean = (com.sun.management.OperatingSystemMXBean) osBean;
            long totalMem = sunOsBean.getTotalMemorySize();
            long freeMem = sunOsBean.getFreeMemorySize();
            totalRam = totalMem / (1024.0 * 1024.0 * 1024.0);
            usedRam = (totalMem - freeMem) / (1024.0 * 1024.0 * 1024.0);
            ramPercent = (double) (totalMem - freeMem) / totalMem * 100;
        } else {
            // Fallback to JVM memory
            Runtime rt = Runtime.getRuntime();
            long total = rt.totalMemory();
            long free = rt.freeMemory();
            usedRam = (total - free) / (1024.0 * 1024.0 * 1024.0);
            // JVM is just a slice, so we report JVM usage as system proxy for now if OS
            // failed
        }

        // Storage Usage (Current Dir)
        File currentDir = new File(".");
        long totalSpace = currentDir.getTotalSpace();
        long freeSpace = currentDir.getFreeSpace();
        double storagePercent = (double) (totalSpace - freeSpace) / totalSpace * 100;
        double usedStorageGb = (totalSpace - freeSpace) / (1024.0 * 1024.0 * 1024.0);

        // Uptime
        long uptimeMillis = ManagementFactory.getRuntimeMXBean().getUptime();
        long hours = uptimeMillis / 3600000;
        long minutes = (uptimeMillis % 3600000) / 60000;
        String uptime = String.format("%dh %dm", hours, minutes);

        return Map.of(
                "ramPercent", (int) ramPercent,
                "ramUsedGb", String.format("%.1f", usedRam),
                "ramTotalGb", String.format("%.0f", totalRam),
                "storagePercent", (int) storagePercent,
                "storageUsedGb", String.format("%.0f", usedStorageGb),
                "uptime", uptime,
                "vramPercent", 25 // Hard to get without native calls, keep mocked
        );
    }
}
